import { Request, Response } from 'express';
import prisma from '../config/db';

export async function getPublicSettings(req: Request, res: Response) {
  try {
    const [settingsList, deliverySettings] = await Promise.all([
      prisma.websiteSetting.findMany(),
      prisma.deliverySetting.findMany({ orderBy: { charge: 'asc' } }),
    ]);

    const settings: Record<string, string> = {};
    for (const item of settingsList) {
      settings[item.key] = item.value;
    }

    return res.json({
      success: true,
      data: {
        settings,
        deliverySettings,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'সেটিংস লোড করা যায়নি।' });
  }
}
