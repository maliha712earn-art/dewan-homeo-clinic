import { Request, Response } from 'express';
import prisma from '../config/db';

export async function getProducts(req: Request, res: Response) {
  try {
    const { category, search, featured, offer, sort, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const take = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * take;

    const where: any = {
      isPublished: true,
      status: { in: ['ACTIVE', 'OUT_OF_STOCK'] },
    };

    if (category) {
      where.category = { slug: category as string };
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (offer === 'true') {
      where.isSpecialOffer = true;
    }

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { name: { contains: q } },
        { nameBn: { contains: q } },
        { description: { contains: q } },
        { descriptionBn: { contains: q } },
        { sku: { contains: q } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'name_asc') orderBy = { name: 'asc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, nameBn: true, slug: true } },
          images: { select: { id: true, url: true, isPrimary: true }, orderBy: { isPrimary: 'desc' } },
        },
        orderBy,
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
    console.error('getProducts error:', err);
    return res.status(500).json({ success: false, message: 'পণ্য তালিকা লোড করা যায়নি।' });
  }
}

export async function getProductBySlug(req: Request, res: Response) {
  try {
    const slug = req.params.slug as string;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, nameBn: true, slug: true } },
        images: { select: { id: true, url: true, isPrimary: true } },
      },
    });

    if (!product || !product.isPublished) {
      return res.status(404).json({ success: false, message: 'পণ্যটি পাওয়া যায়নি।' });
    }

    // Also fetch related products
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isPublished: true,
      },
      include: {
        category: { select: { id: true, nameBn: true, slug: true } },
        images: { select: { id: true, url: true, isPrimary: true } },
      },
      take: 4,
    });

    return res.json({
      success: true,
      data: { product, relatedProducts },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'পণ্যের তথ্য লোড করা যায়নি।' });
  }
}

export async function getCategories(req: Request, res: Response) {
  try {
    const categories = await prisma.productCategory.findMany({
      include: {
        _count: {
          select: { products: { where: { isPublished: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.json({ success: true, data: categories });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'ক্যাটাগরি লোড করা যায়নি।' });
  }
}
