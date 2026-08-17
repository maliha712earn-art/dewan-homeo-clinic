import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../config/db';
import { signUserToken } from '../utils/jwt.util';
import { AuthRequest } from '../middleware/auth.middleware';

const registerSchema = z.object({
  name: z.string().min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে'),
  phone: z.string().min(11, 'সঠিক মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'),
  password: z.string().min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'),
  email: z.string().email('সঠিক ইমেইল দিন').optional().or(z.literal('')),
  address: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),
});

const loginSchema = z.object({
  phone: z.string().min(10, 'মোবাইল নম্বর লিখুন'),
  password: z.string().min(1, 'পাসওয়ার্ড লিখুন'),
});

export async function register(req: Request, res: Response) {
  try {
    const validated = registerSchema.parse(req.body);

    const cleanPhone = validated.phone.trim();
    const existing = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে।' });
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);
    const user = await prisma.user.create({
      data: {
        name: validated.name.trim(),
        phone: cleanPhone,
        email: validated.email ? validated.email.trim() : null,
        passwordHash,
        address: validated.address || null,
        district: validated.district || null,
        upazila: validated.upazila || null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        district: true,
        upazila: true,
        createdAt: true,
      },
    });

    const token = signUserToken({ userId: user.id, phone: user.phone });

    return res.status(201).json({
      success: true,
      message: 'রেজিস্ট্রেশন সফল হয়েছে!',
      data: { user, token },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'রেজিস্ট্রেশনে ত্রুটি ঘটেছে।' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const validated = loginSchema.parse(req.body);
    const cleanPhone = validated.phone.trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { email: cleanPhone },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'ভুল মোবাইল নম্বর বা পাসওয়ার্ড।' });
    }

    const isValid = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'ভুল মোবাইল নম্বর বা পাসওয়ার্ড।' });
    }

    const token = signUserToken({ userId: user.id, phone: user.phone });

    const safeUser = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      address: user.address,
      district: user.district,
      upazila: user.upazila,
      createdAt: user.createdAt,
    };

    return res.json({
      success: true,
      message: 'লগইন সফল হয়েছে!',
      data: { user: safeUser, token },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    return res.status(500).json({ success: false, message: 'লগইনে ত্রুটি ঘটেছে।' });
  }
}

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'অননুমোদিত।' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        district: true,
        upazila: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            consultations: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি।' });
    }

    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'প্রোফাইল লোড করতে সমস্যা হয়েছে।' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'অননুমোদিত।' });

    const { name, email, address, district, upazila } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(email !== undefined ? { email: email ? email.trim() : null } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(district !== undefined ? { district } : {}),
        ...(upazila !== undefined ? { upazila } : {}),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        district: true,
        upazila: true,
        createdAt: true,
      },
    });

    return res.json({ success: true, message: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে।', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।' });
  }
}
