import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface UserTokenPayload {
  userId: string;
  phone: string;
  role?: string;
}

export interface AdminTokenPayload {
  adminId: string;
  email: string;
  role: string;
}

export function signUserToken(payload: UserTokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
}

export function verifyUserToken(token: string): UserTokenPayload {
  return jwt.verify(token, config.jwtSecret) as UserTokenPayload;
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, config.adminJwtSecret, { expiresIn: '7d' });
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  try {
    return jwt.verify(token, config.adminJwtSecret) as AdminTokenPayload;
  } catch (err) {
    // Fallback: Check with standard jwtSecret in case server environment used general secret
    return jwt.verify(token, config.jwtSecret) as AdminTokenPayload;
  }
}
