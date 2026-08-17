import { Request, Response } from 'express';
import prisma from '../config/db';

export async function getServices(req: Request, res: Response) {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return res.json({ success: true, data: services });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'সেবার তালিকা লোড করা যায়নি।' });
  }
}

export async function getServiceBySlug(req: Request, res: Response) {
  try {
    const slug = req.params.slug as string;
    const service = await prisma.service.findUnique({
      where: { slug },
    });

    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: 'সেবাটি পাওয়া যায়নি।' });
    }

    return res.json({ success: true, data: service });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'সেবার তথ্য লোড করা যায়নি।' });
  }
}
