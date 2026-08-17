import { Request, Response, NextFunction } from 'express';
import { verifyUserToken } from '../utils/jwt.util';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    phone: string;
    role?: string;
  };
}

export function authenticateUser(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyUserToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'সেশন অকার্যকর বা মেয়াদোত্তীর্ণ। পুনরায় লগইন করুন।' });
  }
}

export function optionalAuthenticateUser(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = verifyUserToken(token);
    } catch {
      // Ignore optional auth failure
    }
  }
  next();
}
