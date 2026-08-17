import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../config/db';
import { signAdminToken } from '../utils/jwt.util';
import { AdminAuthRequest } from '../middleware/adminAuth.middleware';
import { logAdminAction } from '../utils/audit.util';

const adminLoginSchema = z.object({
  email: z.string().email('সঠিক ইমেইল দিন'),
  password: z.string().min(1, 'পাসওয়ার্ড লিখুন'),
});

export async function adminLogin(req: Request, res: Response) {
  try {
    const validated = adminLoginSchema.parse(req.body);
    const email = validated.email.trim().toLowerCase();

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'ভুল ইমেইল বা পাসওয়ার্ড অথবা অ্যাকাউন্ট নিষ্ক্রিয়।' });
    }

    const isMatch = await bcrypt.compare(validated.password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'ভুল ইমেইল বা পাসওয়ার্ড।' });
    }

    const token = signAdminToken({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    });

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'LOGIN',
      details: 'Admin logged in successfully',
      ipAddress: req.ip,
    });

    return res.json({
      success: true,
      message: 'অ্যাডমিন লগইন সফল হয়েছে!',
      data: {
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
        token,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    console.error('Admin login error:', err);
    return res.status(500).json({ success: false, message: 'অ্যাডমিন লগইনে ত্রুটি ঘটেছে।' });
  }
}

export async function getAdminMe(req: AdminAuthRequest, res: Response) {
  try {
    if (!req.admin) return res.status(401).json({ success: false, message: 'অননুমোদিত।' });

    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.adminId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!admin) return res.status(404).json({ success: false, message: 'অ্যাডমিন পাওয়া যায়নি।' });

    return res.json({ success: true, data: admin });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'অ্যাডমিন ডাটা লোড করা যায়নি।' });
  }
}

export async function listAdminUsers(req: AdminAuthRequest, res: Response) {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: admins });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'অ্যাডমিন তালিকা আনতে সমস্যা হয়েছে।' });
  }
}

export async function createAdminUser(req: AdminAuthRequest, res: Response) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'নাম, ইমেইল ও পাসওয়ার্ড আবশ্যক।' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const exist = await prisma.admin.findUnique({ where: { email: cleanEmail } });
    if (exist) {
      return res.status(400).json({ success: false, message: 'এই ইমেইলে ইতিমধ্যে অ্যাডমিন অ্যাকাউন্ট রয়েছে।' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.admin.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: role || 'STAFF',
      },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });

    await logAdminAction({
      adminId: req.admin?.adminId,
      adminEmail: req.admin?.email,
      action: 'CREATE_ADMIN_USER',
      targetType: 'ADMIN',
      targetId: newAdmin.id,
      details: `Created admin: ${newAdmin.email} with role ${newAdmin.role}`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, message: 'নতুন অ্যাডমিন তৈরি সম্পন্ন হয়েছে।', data: newAdmin });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'অ্যাডমিন তৈরিতে সমস্যা হয়েছে।' });
  }
}

export async function toggleAdminStatus(req: AdminAuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const { isActive } = req.body;

    if (id === req.admin?.adminId) {
      return res.status(400).json({ success: false, message: 'নিজের অ্যাকাউন্ট নিষ্ক্রিয় করা যাবে না।' });
    }

    const updated = await prisma.admin.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });

    await logAdminAction({
      adminId: req.admin?.adminId,
      adminEmail: req.admin?.email,
      action: 'TOGGLE_ADMIN_STATUS',
      targetType: 'ADMIN',
      targetId: id,
      details: `Admin ${updated.email} active status set to ${isActive}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'অ্যাডমিন স্ট্যাটাস পরিবর্তন করা হয়েছে।', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'স্ট্যাটাস পরিবর্তনে সমস্যা হয়েছে।' });
  }
}
