import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';

const contactSchema = z.object({
  name: z.string().min(2, 'আপনার নাম লিখুন'),
  phone: z.string().min(11, 'সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন'),
  email: z.string().email('সঠিক ইমেইল দিন').optional().or(z.literal('')),
  subject: z.string().optional(),
  message: z.string().min(5, 'আপনার বার্তা বা প্রশ্ন লিখুন'),
});

export async function submitContactMessage(req: Request, res: Response) {
  try {
    const validated = contactSchema.parse(req.body);

    const message = await prisma.contactMessage.create({
      data: {
        name: validated.name.trim(),
        phone: validated.phone.trim(),
        email: validated.email ? validated.email.trim() : null,
        subject: validated.subject ? validated.subject.trim() : 'সাধারণ অনুসন্ধান',
        message: validated.message.trim(),
        status: 'NEW',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'আপনার বার্তাটি সফলভাবে পৌঁছানো হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।',
      data: { id: message.id },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    console.error('Contact message error:', err);
    return res.status(500).json({ success: false, message: 'বার্তা প্রেরণে সমস্যা হয়েছে।' });
  }
}
