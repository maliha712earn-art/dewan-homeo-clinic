import { Request, Response } from 'express';
import prisma from '../config/db';

export async function getBeforeAfterCases(req: Request, res: Response) {
  try {
    const { category } = req.query;
    const where: any = {
      isPublished: true,
      hasConsent: true,
    };

    if (category) {
      where.category = category as string;
    }

    const cases = await prisma.beforeAfterCase.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return res.json({ success: true, data: cases });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'কেস স্টাডি লোড করা যায়নি।' });
  }
}
