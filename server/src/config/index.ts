import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  adminUrl: process.env.ADMIN_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dewan-homeo-clinic-secret-jwt-key-2026-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminJwtSecret: process.env.ADMIN_JWT_SECRET || 'dewan-homeo-clinic-admin-super-secret-key-2026',
  storageProvider: process.env.STORAGE_PROVIDER || 'local',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
};
