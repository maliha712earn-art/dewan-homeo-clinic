import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const baseUploadDir = path.resolve(__dirname, '../../uploads');
const publicUploadDir = path.join(baseUploadDir, 'public');
const privateConsultationDir = path.join(baseUploadDir, 'consultations');

// Ensure directories exist
if (!fs.existsSync(baseUploadDir)) fs.mkdirSync(baseUploadDir, { recursive: true });
if (!fs.existsSync(publicUploadDir)) fs.mkdirSync(publicUploadDir, { recursive: true });
if (!fs.existsSync(privateConsultationDir)) fs.mkdirSync(privateConsultationDir, { recursive: true });

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('শুধুমাত্র JPEG, PNG, WEBP ফরম্যাটের ছবি আপলোড করা যাবে।'));
  }
};

// Storage for public media (products, services, blogs, banners, before-after)
const publicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, publicUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `media-${uniqueSuffix}${ext}`);
  },
});

// Storage for private consultation images
const consultationStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, privateConsultationDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `consult-${uniqueSuffix}${ext}`);
  },
});

export const uploadPublicImage = multer({
  storage: publicStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

export const uploadConsultationImage = multer({
  storage: consultationStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});
