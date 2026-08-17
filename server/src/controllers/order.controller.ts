import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { generateUniqueOrderNumber } from '../utils/orderId.util';
import { AuthRequest } from '../middleware/auth.middleware';

const createOrderSchema = z.object({
  customerName: z.string().min(2, 'আপনার পূর্ণ নাম লিখুন'),
  phone: z.string().min(11, 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'),
  deliveryAddress: z.string().min(5, 'পূর্ণ ডেলিভারি ঠিকানা লিখুন'),
  district: z.string().min(2, 'জেলার নাম নির্বাচন বা লিখুন'),
  upazila: z.string().optional(),
  email: z.string().email('সঠিক ইমেইল দিন').optional().or(z.literal('')),
  customerNote: z.string().optional(),
  paymentMethod: z.string().default('COD'),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().min(1),
    })
  ).min(1, 'কার্ট খালি, অর্ডার করতে কমপক্ষে ১টি পণ্য নির্বাচন করুন'),
  deliveryCharge: z.number().nonnegative().optional(),
});

export async function createOrder(req: AuthRequest, res: Response) {
  try {
    const validated = createOrderSchema.parse(req.body);
    const userId = req.user?.userId || null;

    // Check if guest checkout is allowed if not logged in
    if (!userId) {
      const guestSetting = await prisma.websiteSetting.findUnique({
        where: { key: 'GUEST_CHECKOUT_ENABLED' },
      });
      if (guestSetting && guestSetting.value === 'false') {
        return res.status(403).json({
          success: false,
          message: 'অর্ডার সম্পন্ন করার জন্য অনুগ্রহ করে প্রথমে লগইন করুন বা অ্যাকাউন্ট তৈরি করুন।',
        });
      }
    }

    // Fetch products and calculate total
    const productIds = validated.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        images: { select: { url: true, isPrimary: true } },
      },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ success: false, message: 'কিছু পণ্য পাওয়া যায়নি বা অনুপলব্ধ।' });
    }

    let subtotal = 0;
    const orderItemsData: any[] = [];

    for (const item of validated.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) continue;

      if (prod.status === 'INACTIVE' || !prod.isPublished) {
        return res.status(400).json({ success: false, message: `"${prod.nameBn || prod.name}" বর্তমানে অর্ডারের জন্য উপলব্ধ নেই।` });
      }

      if (prod.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `"${prod.nameBn || prod.name}" পর্যাপ্ত স্টকে নেই (স্টক: ${prod.stock})।` });
      }

      const itemPrice = prod.discountPrice && prod.discountPrice > 0 ? prod.discountPrice : prod.price;
      const lineTotal = itemPrice * item.quantity;
      subtotal += lineTotal;

      const primaryImage = prod.images.find((img) => img.isPrimary)?.url || prod.images[0]?.url || null;

      orderItemsData.push({
        productId: prod.id,
        productName: prod.nameBn || prod.name,
        price: itemPrice,
        quantity: item.quantity,
        total: lineTotal,
        image: primaryImage,
      });
    }

    // Determine delivery charge
    let deliveryCharge = validated.deliveryCharge !== undefined ? validated.deliveryCharge : 120;
    const totalAmount = subtotal + deliveryCharge;

    const orderNumber = await generateUniqueOrderNumber();

    // Create Order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          customerName: validated.customerName.trim(),
          phone: validated.phone.trim(),
          deliveryAddress: validated.deliveryAddress.trim(),
          district: validated.district ? validated.district.trim() : null,
          upazila: validated.upazila ? validated.upazila.trim() : null,
          cityDistrict: validated.district ? validated.district.trim() : null,
          customerNote: validated.customerNote ? validated.customerNote.trim() : null,
          subtotal,
          deliveryCharge,
          totalAmount,
          paymentMethod: validated.paymentMethod,
          paymentStatus: 'PENDING',
          orderStatus: 'Pending',
          items: {
            create: orderItemsData,
          },
          statusHistory: {
            create: {
              status: 'Pending',
              note: 'গ্রাহক দ্বারা নতুন অর্ডার প্লেস করা হয়েছে।',
              changedBy: 'CUSTOMER',
            },
          },
        },
        include: {
          items: true,
        },
      });

      // 2. Decrement stock
      for (const item of validated.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return res.status(201).json({
      success: true,
      message: 'আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!',
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        customerName: order.customerName,
        phone: order.phone,
        deliveryAddress: order.deliveryAddress,
        itemsCount: order.items.length,
        createdAt: order.createdAt,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    console.error('Create order error:', err);
    return res.status(500).json({ success: false, message: 'অর্ডার সম্পন্ন করতে সমস্যা হয়েছে।' });
  }
}

export async function trackOrder(req: Request, res: Response) {
  try {
    const orderNumber = ((req.params.orderNumber as string) || (req.query.orderNumber as string) || '').trim();
    const phone = ((req.query.phone as string) || '').trim();

    if (!orderNumber) {
      return res.status(400).json({ success: false, message: 'অর্ডার নম্বর প্রদান করুন।' });
    }

    const where: any = { orderNumber };
    if (phone) {
      where.phone = phone;
    }

    const order = await prisma.order.findFirst({
      where,
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'উক্ত নম্বর দিয়ে কোনো অর্ডার পাওয়া যায়নি।' });
    }

    return res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge,
        totalAmount: order.totalAmount,
        customerName: order.customerName,
        phone: order.phone,
        deliveryAddress: order.deliveryAddress,
        district: order.district,
        createdAt: order.createdAt,
        items: order.items,
        statusHistory: order.statusHistory,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'অর্ডার ট্র্যাকিং তথ্য লোড করা যায়নি।' });
  }
}

export async function getCustomerOrders(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'অননুমোদিত।' });

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'অর্ডারের তালিকা লোড করা যায়নি।' });
  }
}
