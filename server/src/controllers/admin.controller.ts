import { Response } from 'express';
import prisma from '../config/db';
import { AdminAuthRequest } from '../middleware/adminAuth.middleware';
import { logAdminAction } from '../utils/audit.util';

// -------------------------------------------------------------
// 1. DASHBOARD STATS
// -------------------------------------------------------------
export async function getDashboardStats(req: AdminAuthRequest, res: Response) {
  try {
    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      revenueResult,
      totalCustomers,
      totalConsultations,
      newConsultations,
      totalMessages,
      newMessages,
      totalProducts,
      totalServices,
      recentOrders,
      recentConsultations,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: 'Pending' } }),
      prisma.order.count({ where: { orderStatus: 'Confirmed' } }),
      prisma.order.count({ where: { orderStatus: 'Processing' } }),
      prisma.order.count({ where: { orderStatus: 'Shipped' } }),
      prisma.order.count({ where: { orderStatus: 'Delivered' } }),
      prisma.order.count({ where: { orderStatus: 'Cancelled' } }),
      prisma.order.aggregate({
        where: { orderStatus: { not: 'Cancelled' } },
        _sum: { totalAmount: true },
      }),
      prisma.user.count(),
      prisma.consultation.count(),
      prisma.consultation.count({ where: { status: 'NEW' } }),
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { status: 'NEW' } }),
      prisma.product.count(),
      prisma.service.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.consultation.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
          totalRevenue: revenueResult._sum.totalAmount || 0,
        },
        customers: {
          total: totalCustomers,
        },
        consultations: {
          total: totalConsultations,
          new: newConsultations,
        },
        messages: {
          total: totalMessages,
          new: newMessages,
        },
        products: {
          total: totalProducts,
        },
        services: {
          total: totalServices,
        },
        recentOrders,
        recentConsultations,
      },
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return res.status(500).json({ success: false, message: 'ড্যাশবোর্ড পরিসংখ্যান লোড করা যায়নি।' });
  }
}

// -------------------------------------------------------------
// 2. ORDER MANAGEMENT
// -------------------------------------------------------------
export async function getOrdersAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const { status, search, page = '1', limit = '15' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const take = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.orderStatus = status as string;
    }

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { orderNumber: { contains: q } },
        { customerName: { contains: q } },
        { phone: { contains: q } },
        { deliveryAddress: { contains: q } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.order.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: pageNum,
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'অর্ডার তালিকা আনতে সমস্যা হয়েছে।' });
  }
}

export async function getOrderByIdAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        user: { select: { id: true, name: true, phone: true, email: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি।' });
    }

    return res.json({ success: true, data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'অর্ডারের বিবরণ লোড করা যায়নি।' });
  }
}

export async function updateOrderStatusAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const { status, note, paymentStatus } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি।' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id },
        data: {
          ...(status ? { orderStatus: status } : {}),
          ...(paymentStatus ? { paymentStatus } : {}),
        },
        include: { items: true, statusHistory: true },
      });

      if (status && status !== order.orderStatus) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            status,
            note: note || `অর্ডার স্ট্যাটাস পরিবর্তিত হয়েছে: ${status}`,
            changedBy: req.admin?.email || 'ADMIN',
          },
        });
      }

      return ord;
    });

    await logAdminAction({
      adminId: req.admin?.adminId,
      adminEmail: req.admin?.email,
      action: 'UPDATE_ORDER_STATUS',
      targetType: 'ORDER',
      targetId: id,
      details: `Order #${order.orderNumber} status changed to ${status}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'অর্ডার স্ট্যাটাস সফলভাবে আপডেট হয়েছে।', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'স্ট্যাটাস আপডেটে সমস্যা হয়েছে।' });
  }
}

export async function updateOrderNotesAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const { adminNotes } = req.body;

    const updated = await prisma.order.update({
      where: { id },
      data: { adminNotes },
    });

    return res.json({ success: true, message: 'অভ্যন্তরীণ নোট সংরক্ষণ করা হয়েছে।', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'নোট সংরক্ষণে সমস্যা হয়েছে।' });
  }
}

// -------------------------------------------------------------
// 3. CONSULTATION MANAGEMENT
// -------------------------------------------------------------
export async function getConsultationsAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const { status, search, page = '1', limit = '15' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const take = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status as string;
    }

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
        { problem: { contains: q } },
      ];
    }

    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        include: {
          images: true,
          user: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.consultation.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        consultations,
        pagination: {
          total,
          page: pageNum,
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'পরামর্শ অনুরোধ লোড করা যায়নি।' });
  }
}

export async function updateConsultationStatusAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const { status, adminNotes } = req.body;

    const updated = await prisma.consultation.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(adminNotes !== undefined ? { adminNotes } : {}),
      },
      include: { images: true },
    });

    await logAdminAction({
      adminId: req.admin?.adminId,
      adminEmail: req.admin?.email,
      action: 'UPDATE_CONSULTATION',
      targetType: 'CONSULTATION',
      targetId: id,
      details: `Consultation status changed to ${status}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'পরামর্শ অনুরোধ আপডেট করা হয়েছে।', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'পরামর্শ অনুরোধ আপডেটে সমস্যা হয়েছে।' });
  }
}

// -------------------------------------------------------------
// 4. PRODUCT MANAGEMENT (CRUD)
// -------------------------------------------------------------
export async function getProductsAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const { category, status, search, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const take = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (category) where.categoryId = category as string;
    if (status && status !== 'ALL') where.status = status as string;
    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { name: { contains: q } },
        { nameBn: { contains: q } },
        { sku: { contains: q } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: pageNum,
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'পণ্য তালিকা লোড করা যায়নি।' });
  }
}

export async function createProductAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const {
      name,
      nameBn,
      slug,
      description,
      descriptionBn,
      price,
      discountPrice,
      stock,
      sku,
      brand,
      weightSize,
      status,
      isPublished,
      isFeatured,
      isSpecialOffer,
      isNew,
      categoryId,
      images,
    } = req.body;

    if (!name || !nameBn || !price || !categoryId) {
      return res.status(400).json({ success: false, message: 'নাম (বাংলা ও ইংরেজি), মূল্য এবং ক্যাটাগরি আবশ্যক।' });
    }

    const cleanSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) + '-' + Date.now().toString().slice(-4);

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        nameBn: nameBn.trim(),
        slug: cleanSlug,
        description: description || name,
        descriptionBn: descriptionBn || nameBn,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        stock: stock !== undefined ? parseInt(stock, 10) : 0,
        sku: sku ? sku.trim() : `DH-${Date.now().toString().slice(-6)}`,
        brand: brand || 'দেওয়ান হোমিও ক্লিনিক',
        weightSize: weightSize || null,
        status: status || 'ACTIVE',
        isPublished: isPublished !== false,
        isFeatured: Boolean(isFeatured),
        isSpecialOffer: Boolean(isSpecialOffer),
        isNew: Boolean(isNew),
        categoryId,
        images: {
          create: Array.isArray(images) ? images.map((url: string, idx: number) => ({ url, isPrimary: idx === 0 })) : [],
        },
      },
      include: { category: true, images: true },
    });

    await logAdminAction({
      adminId: req.admin?.adminId,
      adminEmail: req.admin?.email,
      action: 'CREATE_PRODUCT',
      targetType: 'PRODUCT',
      targetId: product.id,
      details: `Created product: ${product.nameBn}`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, message: 'নতুন পণ্য সফলভাবে তৈরি হয়েছে।', data: product });
  } catch (err) {
    console.error('Create product error:', err);
    return res.status(500).json({ success: false, message: 'পণ্য তৈরি করতে সমস্যা হয়েছে।' });
  }
}

export async function updateProductAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const {
      name,
      nameBn,
      slug,
      description,
      descriptionBn,
      price,
      discountPrice,
      stock,
      sku,
      brand,
      weightSize,
      status,
      isPublished,
      isFeatured,
      isSpecialOffer,
      isNew,
      categoryId,
      images,
    } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'পণ্য পাওয়া যায়নি।' });

    const updated = await prisma.$transaction(async (tx) => {
      if (Array.isArray(images)) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: images.map((url: string, idx: number) => ({
            productId: id,
            url,
            isPrimary: idx === 0,
          })),
        });
      }

      return tx.product.update({
        where: { id },
        data: {
          ...(name ? { name: name.trim() } : {}),
          ...(nameBn ? { nameBn: nameBn.trim() } : {}),
          ...(slug ? { slug: slug.trim() } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(descriptionBn !== undefined ? { descriptionBn } : {}),
          ...(price !== undefined ? { price: parseFloat(price) } : {}),
          ...(discountPrice !== undefined ? { discountPrice: discountPrice ? parseFloat(discountPrice) : null } : {}),
          ...(stock !== undefined ? { stock: parseInt(stock, 10) } : {}),
          ...(sku !== undefined ? { sku } : {}),
          ...(brand !== undefined ? { brand } : {}),
          ...(weightSize !== undefined ? { weightSize } : {}),
          ...(status !== undefined ? { status } : {}),
          ...(isPublished !== undefined ? { isPublished: Boolean(isPublished) } : {}),
          ...(isFeatured !== undefined ? { isFeatured: Boolean(isFeatured) } : {}),
          ...(isSpecialOffer !== undefined ? { isSpecialOffer: Boolean(isSpecialOffer) } : {}),
          ...(isNew !== undefined ? { isNew: Boolean(isNew) } : {}),
          ...(categoryId ? { categoryId } : {}),
        },
        include: { category: true, images: true },
      });
    });

    await logAdminAction({
      adminId: req.admin?.adminId,
      adminEmail: req.admin?.email,
      action: 'UPDATE_PRODUCT',
      targetType: 'PRODUCT',
      targetId: id,
      details: `Updated product: ${updated.nameBn}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'পণ্য সফলভাবে আপডেট করা হয়েছে।', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'পণ্য আপডেট করতে সমস্যা হয়েছে।' });
  }
}

export async function deleteProductAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const deleted = await prisma.product.delete({ where: { id } });

    await logAdminAction({
      adminId: req.admin?.adminId,
      adminEmail: req.admin?.email,
      action: 'DELETE_PRODUCT',
      targetType: 'PRODUCT',
      targetId: id,
      details: `Deleted product: ${deleted.nameBn}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'পণ্য সফলভাবে মুছে ফেলা হয়েছে।' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'পণ্য মুছতে সমস্যা হয়েছে।' });
  }
}

// -------------------------------------------------------------
// 5. SERVICE MANAGEMENT (CRUD)
// -------------------------------------------------------------
export async function getServicesAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const services = await prisma.service.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return res.json({ success: true, data: services });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'সেবা তালিকা লোড করা যায়নি।' });
  }
}

export async function createServiceAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const { title, titleBn, slug, description, descriptionBn, imageUrl, price, sortOrder, isActive } = req.body;
    if (!title || !titleBn || !descriptionBn) {
      return res.status(400).json({ success: false, message: 'সেবার নাম ও বিবরণ আবশ্যক।' });
    }

    const cleanSlug = (slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) + '-' + Date.now().toString().slice(-4);

    const service = await prisma.service.create({
      data: {
        title: title.trim(),
        titleBn: titleBn.trim(),
        slug: cleanSlug,
        description: description || title,
        descriptionBn: descriptionBn.trim(),
        imageUrl: imageUrl || null,
        price: price ? parseFloat(price) : null,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : 0,
        isActive: isActive !== false,
      },
    });

    await logAdminAction({
      adminId: req.admin?.adminId,
      adminEmail: req.admin?.email,
      action: 'CREATE_SERVICE',
      targetType: 'SERVICE',
      targetId: service.id,
      details: `Created service: ${service.titleBn}`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, message: 'নতুন সেবা যোগ করা হয়েছে।', data: service });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'সেবা তৈরিতে সমস্যা হয়েছে।' });
  }
}

export async function updateServiceAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const { title, titleBn, slug, description, descriptionBn, imageUrl, price, sortOrder, isActive } = req.body;

    const updated = await prisma.service.update({
      where: { id },
      data: {
        ...(title ? { title: title.trim() } : {}),
        ...(titleBn ? { titleBn: titleBn.trim() } : {}),
        ...(slug ? { slug: slug.trim() } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(descriptionBn !== undefined ? { descriptionBn: descriptionBn.trim() } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(price !== undefined ? { price: price ? parseFloat(price) : null } : {}),
        ...(sortOrder !== undefined ? { sortOrder: parseInt(sortOrder, 10) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    return res.json({ success: true, message: 'সেবা আপডেট করা হয়েছে।', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'সেবা আপডেটে সমস্যা হয়েছে।' });
  }
}

export async function deleteServiceAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    await prisma.service.delete({ where: { id } });
    return res.json({ success: true, message: 'সেবা মুছে ফেলা হয়েছে।' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'সেবা মুছতে সমস্যা হয়েছে।' });
  }
}

// -------------------------------------------------------------
// 6. BEFORE & AFTER MANAGEMENT (CRUD)
// -------------------------------------------------------------
export async function getBeforeAfterAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const cases = await prisma.beforeAfterCase.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return res.json({ success: true, data: cases });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'কেস তালিকা আনতে সমস্যা হয়েছে।' });
  }
}

export async function createBeforeAfterAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const { title, titleBn, descriptionBn, category, beforeImage, afterImage, durationText, hasConsent, isPublished, sortOrder } = req.body;
    if (!titleBn || !beforeImage || !afterImage) {
      return res.status(400).json({ success: false, message: 'শিরোনাম, আগের ছবি ও পরের ছবি আবশ্যক।' });
    }

    const newCase = await prisma.beforeAfterCase.create({
      data: {
        title: title || titleBn,
        titleBn: titleBn.trim(),
        descriptionBn: descriptionBn || null,
        category: category || 'ত্বকের সমস্যা',
        beforeImage,
        afterImage,
        durationText: durationText || null,
        hasConsent: hasConsent !== false,
        isPublished: isPublished !== false,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : 0,
      },
    });

    return res.status(201).json({ success: true, message: 'নতুন কেস যোগ করা হয়েছে।', data: newCase });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'কেস তৈরিতে সমস্যা হয়েছে।' });
  }
}

export async function updateBeforeAfterAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const { titleBn, descriptionBn, category, beforeImage, afterImage, durationText, hasConsent, isPublished, sortOrder } = req.body;

    const updated = await prisma.beforeAfterCase.update({
      where: { id },
      data: {
        ...(titleBn ? { titleBn: titleBn.trim() } : {}),
        ...(descriptionBn !== undefined ? { descriptionBn } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(beforeImage !== undefined ? { beforeImage } : {}),
        ...(afterImage !== undefined ? { afterImage } : {}),
        ...(durationText !== undefined ? { durationText } : {}),
        ...(hasConsent !== undefined ? { hasConsent: Boolean(hasConsent) } : {}),
        ...(isPublished !== undefined ? { isPublished: Boolean(isPublished) } : {}),
        ...(sortOrder !== undefined ? { sortOrder: parseInt(sortOrder, 10) } : {}),
      },
    });

    return res.json({ success: true, message: 'কেস সফলভাবে আপডেট করা হয়েছে।', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'কেস আপডেটে সমস্যা হয়েছে।' });
  }
}

export async function deleteBeforeAfterAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    await prisma.beforeAfterCase.delete({ where: { id } });
    return res.json({ success: true, message: 'কেস মুছে ফেলা হয়েছে।' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'কেস মুছতে সমস্যা হয়েছে।' });
  }
}

// -------------------------------------------------------------
// 7. BLOG MANAGEMENT (CRUD)
// -------------------------------------------------------------
export async function getArticlesAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const articles = await prisma.article.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: articles });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'আর্টিকেল তালিকা আনতে সমস্যা হয়েছে।' });
  }
}

export async function createArticleAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const { titleBn, title, slug, contentBn, excerptBn, coverImage, author, tags, seoTitle, seoDescription, isPublished, categoryId } = req.body;
    if (!titleBn || !contentBn || !categoryId) {
      return res.status(400).json({ success: false, message: 'শিরোনাম, মূল কনটেন্ট এবং ক্যাটাগরি আবশ্যক।' });
    }

    const cleanSlug = (slug || (title || titleBn).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) + '-' + Date.now().toString().slice(-4);

    const article = await prisma.article.create({
      data: {
        title: title || titleBn,
        titleBn: titleBn.trim(),
        slug: cleanSlug,
        content: contentBn,
        contentBn: contentBn.trim(),
        excerpt: excerptBn || null,
        excerptBn: excerptBn ? excerptBn.trim() : null,
        coverImage: coverImage || null,
        author: author || 'দেওয়ান হোমিও ক্লিনিক',
        tags: tags || null,
        seoTitle: seoTitle || titleBn,
        seoDescription: seoDescription || excerptBn,
        isPublished: isPublished !== false,
        categoryId,
      },
      include: { category: true },
    });

    return res.status(201).json({ success: true, message: 'আর্টিকেল সফলভাবে প্রকাশ হয়েছে।', data: article });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'আর্টিকেল তৈরিতে সমস্যা হয়েছে।' });
  }
}

export async function updateArticleAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const { titleBn, contentBn, excerptBn, coverImage, author, tags, seoTitle, seoDescription, isPublished, categoryId } = req.body;

    const updated = await prisma.article.update({
      where: { id },
      data: {
        ...(titleBn ? { titleBn: titleBn.trim() } : {}),
        ...(contentBn ? { contentBn: contentBn.trim(), content: contentBn.trim() } : {}),
        ...(excerptBn !== undefined ? { excerptBn: excerptBn ? excerptBn.trim() : null } : {}),
        ...(coverImage !== undefined ? { coverImage } : {}),
        ...(author !== undefined ? { author } : {}),
        ...(tags !== undefined ? { tags } : {}),
        ...(seoTitle !== undefined ? { seoTitle } : {}),
        ...(seoDescription !== undefined ? { seoDescription } : {}),
        ...(isPublished !== undefined ? { isPublished: Boolean(isPublished) } : {}),
        ...(categoryId ? { categoryId } : {}),
      },
      include: { category: true },
    });

    return res.json({ success: true, message: 'আর্টিকেল সফলভাবে আপডেট করা হয়েছে।', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'আর্টিকেল আপডেটে সমস্যা হয়েছে।' });
  }
}

export async function deleteArticleAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    await prisma.article.delete({ where: { id } });
    return res.json({ success: true, message: 'আর্টিকেল মুছে ফেলা হয়েছে।' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'আর্টিকেল মুছতে সমস্যা হয়েছে।' });
  }
}

// -------------------------------------------------------------
// 8. CUSTOMERS DIRECTORY
// -------------------------------------------------------------
export async function getCustomersAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const { search, page = '1', limit = '12' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const take = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
        { address: { contains: q } },
        { district: { contains: q } },
        { upazila: { contains: q } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        include: {
          _count: { select: { orders: true, consultations: true } },
          orders: {
            select: { id: true, totalAmount: true, orderStatus: true, createdAt: true },
          },
          consultations: {
            select: { id: true, status: true, createdAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    const formatted = users.map((u) => {
      const totalSpent = u.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      return {
        id: u.id,
        name: u.name,
        phone: u.phone,
        email: u.email || null,
        address: u.address || 'ঠিকানা দেওয়া হয়নি',
        district: u.district || 'চাঁদপুর',
        upazila: u.upazila || null,
        ordersCount: u._count.orders,
        consultationsCount: u._count.consultations,
        totalSpent,
        status: 'ACTIVE',
        createdAt: u.createdAt,
      };
    });

    const [withOrdersCount, withConsultationsCount] = await Promise.all([
      prisma.user.count({ where: { orders: { some: {} } } }),
      prisma.user.count({ where: { consultations: { some: {} } } }),
    ]);

    return res.json({
      success: true,
      data: {
        customers: formatted,
        pagination: {
          total,
          page: pageNum,
          limit: take,
          totalPages: Math.ceil(total / take) || 1,
        },
        counts: {
          total,
          withOrders: withOrdersCount,
          withConsultations: withConsultationsCount,
        },
      },
    });
  } catch (err) {
    console.error('getCustomersAdmin error:', err);
    return res.status(500).json({ success: false, message: 'গ্রাহক তালিকা লোড করা যায়নি।' });
  }
}

export async function getCustomerDetailAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          include: { items: true, statusHistory: { orderBy: { createdAt: 'desc' } } },
          orderBy: { createdAt: 'desc' },
        },
        consultations: {
          include: { images: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'গ্রাহক পাওয়া যায়নি।' });
    }

    const totalSpent = user.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return res.json({
      success: true,
      data: {
        customer: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          address: user.address,
          district: user.district,
          upazila: user.upazila,
          createdAt: user.createdAt,
          totalSpent,
          ordersCount: user.orders.length,
          consultationsCount: user.consultations.length,
        },
        orders: user.orders,
        consultations: user.consultations,
      },
    });
  } catch (err) {
    console.error('getCustomerDetailAdmin error:', err);
    return res.status(500).json({ success: false, message: 'গ্রাহকের বিবরণ আনতে সমস্যা হয়েছে।' });
  }
}

// -------------------------------------------------------------
// 9. CONTACT MESSAGES MANAGEMENT
// -------------------------------------------------------------
export async function getMessagesAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const { status, search, page = '1', limit = '12' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const take = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * take;

    const where: any = {};

    if (status && status !== 'ALL') {
      if (status === 'UNREAD' || status === 'NEW') {
        where.status = 'NEW';
      } else if (status === 'READ') {
        where.status = { not: 'NEW' };
      } else {
        where.status = status as string;
      }
    }

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
        { subject: { contains: q } },
        { message: { contains: q } },
      ];
    }

    const [messages, total, unreadCount, readCount, totalAll] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.count({ where: { status: 'NEW' } }),
      prisma.contactMessage.count({ where: { status: { not: 'NEW' } } }),
      prisma.contactMessage.count(),
    ]);

    return res.json({
      success: true,
      data: {
        messages,
        pagination: {
          total,
          page: pageNum,
          limit: take,
          totalPages: Math.ceil(total / take) || 1,
        },
        counts: {
          total: totalAll,
          unread: unreadCount,
          read: readCount,
        },
      },
    });
  } catch (err) {
    console.error('getMessagesAdmin error:', err);
    return res.status(500).json({ success: false, message: 'বার্তা তালিকা লোড করা যায়নি।' });
  }
}

export async function updateMessageStatusAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const { status, adminNotes } = req.body;

    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'বার্তাটি পাওয়া যায়নি।' });
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(adminNotes !== undefined ? { adminNotes } : {}),
      },
    });

    await logAdminAction({
      adminId: req.admin?.adminId,
      adminEmail: req.admin?.email,
      action: 'UPDATE_MESSAGE_STATUS',
      targetType: 'CONTACT_MESSAGE',
      targetId: id,
      details: `Contact message from ${existing.name} status updated to ${status || existing.status}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'বার্তা স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'বার্তা আপডেটে সমস্যা হয়েছে।' });
  }
}

export async function deleteMessageAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'বার্তাটি পাওয়া যায়নি।' });
    }

    await prisma.contactMessage.delete({ where: { id } });

    await logAdminAction({
      adminId: req.admin?.adminId,
      adminEmail: req.admin?.email,
      action: 'DELETE_MESSAGE',
      targetType: 'CONTACT_MESSAGE',
      targetId: id,
      details: `Deleted contact message from ${existing.name} (${existing.phone})`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'বার্তাটি সফলভাবে মুছে ফেলা হয়েছে।' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'বার্তা মুছতে সমস্যা হয়েছে।' });
  }
}

// -------------------------------------------------------------
// 10. WEBSITE SETTINGS MANAGEMENT
// -------------------------------------------------------------
export async function getSettingsAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const settings = await prisma.websiteSetting.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
    return res.json({ success: true, data: settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'সেটিংস লোড করা যায়নি।' });
  }
}

export async function updateSettingsAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const { settings } = req.body; // array of { key, value, category?, description? }
    if (!Array.isArray(settings)) {
      return res.status(400).json({ success: false, message: 'সঠিক ফরম্যাটে সেটিংস প্রদান করুন।' });
    }

    for (const item of settings) {
      if (item.key) {
        await prisma.websiteSetting.upsert({
          where: { key: item.key },
          update: {
            value: String(item.value ?? ''),
            ...(item.description ? { description: item.description } : {}),
            ...(item.category ? { category: item.category } : {}),
          },
          create: {
            key: item.key,
            value: String(item.value ?? ''),
            description: item.description || null,
            category: item.category || 'GENERAL',
          },
        });
      }
    }

    await logAdminAction({
      adminId: req.admin?.adminId,
      adminEmail: req.admin?.email,
      action: 'UPDATE_WEBSITE_SETTINGS',
      targetType: 'SETTINGS',
      details: `Updated ${settings.length} website settings`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে।' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'সেটিংস সংরক্ষণে সমস্যা হয়েছে।' });
  }
}

// -------------------------------------------------------------
// 11. AUDIT LOGS
// -------------------------------------------------------------
export async function getAuditLogsAdmin(req: AdminAuthRequest, res: Response) {
  try {
    const { search, action, module: moduleFilter, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const take = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * take;

    const where: any = {};

    if (action && action !== 'ALL') {
      where.action = action as string;
    }

    if (moduleFilter && moduleFilter !== 'ALL') {
      where.targetType = moduleFilter as string;
    }

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { action: { contains: q } },
        { targetType: { contains: q } },
        { targetId: { contains: q } },
        { details: { contains: q } },
        { adminEmail: { contains: q } },
        { ipAddress: { contains: q } },
      ];
    }

    const [logs, total, totalAll] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
      prisma.auditLog.count({ where }),
      prisma.auditLog.count(),
    ]);

    return res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: pageNum,
          limit: take,
          totalPages: Math.ceil(total / take) || 1,
        },
        counts: {
          total: totalAll,
        },
      },
    });
  } catch (err) {
    console.error('getAuditLogsAdmin error:', err);
    return res.status(500).json({ success: false, message: 'অডিট লগ লোড করা যায়নি।' });
  }
}
