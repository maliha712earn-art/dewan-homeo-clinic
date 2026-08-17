import { Request, Response, NextFunction } from 'express';
import { verifyAdminToken, AdminTokenPayload } from '../utils/jwt.util';
import prisma from '../config/db';

export interface AdminAuthRequest extends Request {
  admin?: AdminTokenPayload & {
    name?: string;
  };
}

export async function authenticateAdmin(req: AdminAuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'অননুমোদিত অ্যাডমিন অ্যাক্সেস।' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAdminToken(token);
    
    // Check if admin is active in DB
    const admin = await prisma.admin.findUnique({
      where: { id: payload.adminId },
    });

    if (!admin || !admin.isActive) {
      return res.status(403).json({ success: false, message: 'অ্যাডমিন একাউন্ট নিষ্ক্রিয় বা পাওয়া যায়নি।' });
    }

    req.admin = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      name: admin.name,
    };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'অ্যাডমিন সেশনের মেয়াদ শেষ হয়েছে। পুনরায় লগইন করুন।' });
  }
}

export function requireSuperAdmin(req: AdminAuthRequest, res: Response, next: NextFunction) {
  if (!req.admin || req.admin.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'শুধুমাত্র সুপার অ্যাডমিনের জন্য এই অনুমতি প্রযোজ্য।' });
  }
  next();
}
