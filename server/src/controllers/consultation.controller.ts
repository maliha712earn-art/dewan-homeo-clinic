import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';

const consultationSchema = z.object({
  name: z.string().min(2, 'আপনার পূর্ণ নাম লিখুন'),
  phone: z.string().min(11, 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'),
  age: z.union([z.string(), z.number()]).optional().transform((val) => (val ? parseInt(String(val), 10) : undefined)),
  gender: z.string().optional(),
  address: z.string().optional(),
  problem: z.string().min(5, 'আপনার শারীরিক বা ত্বকের সমস্যা বিস্তারিত লিখুন'),
  duration: z.string().optional(),
  previousTreatment: z.string().optional(),
  notes: z.string().optional(),
});

export async function submitConsultation(req: AuthRequest, res: Response) {
  try {
    const validated = consultationSchema.parse(req.body);
    const userId = req.user?.userId || null;

    // Check if consultation is enabled
    const setting = await prisma.websiteSetting.findUnique({
      where: { key: 'CONSULTATION_ENABLED' },
    });
    if (setting && setting.value === 'false') {
      return res.status(403).json({
        success: false,
        message: 'বর্তমানে অনলাইন পরামর্শ গ্রহণ সাময়িকভাবে বন্ধ আছে। সরাসরি কল করুন: 01643184368',
      });
    }

    // Process attached uploaded files if any
    const files = req.files as Express.Multer.File[] | undefined;
    const imageUploads: { url: string }[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        // Save relative path for private upload
        imageUploads.push({
          url: `/uploads/consultations/${file.filename}`,
        });
      }
    }

    const consultation = await prisma.consultation.create({
      data: {
        name: validated.name.trim(),
        phone: validated.phone.trim(),
        age: validated.age || null,
        gender: validated.gender || null,
        address: validated.address ? validated.address.trim() : null,
        problem: validated.problem.trim(),
        duration: validated.duration ? validated.duration.trim() : null,
        previousTreatment: validated.previousTreatment ? validated.previousTreatment.trim() : null,
        notes: validated.notes ? validated.notes.trim() : null,
        userId,
        status: 'NEW',
        isPrivate: true,
        images: {
          create: imageUploads,
        },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'আপনার অনলাইন পরামর্শ অনুরোধ সফলভাবে জমা হয়েছে। আপনার তথ্য দেওয়ার পর প্রয়োজন অনুযায়ী ক্লিনিক থেকে যোগাযোগ করা হবে।',
      data: consultation,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    console.error('Consultation submit error:', err);
    return res.status(500).json({ success: false, message: 'পরামর্শ অনুরোধ পাঠাতে সমস্যা হয়েছে।' });
  }
}

export async function getCustomerConsultations(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'অননুমোদিত।' });

    const consultations = await prisma.consultation.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        problem: true,
        duration: true,
        status: true,
        adminNotes: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: consultations });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'পরামর্শ ইতিহাস লোড করা যায়নি।' });
  }
}
