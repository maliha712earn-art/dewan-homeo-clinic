import { Router, Request, Response } from 'express';
import { authenticateAdmin } from '../middleware/adminAuth.middleware';
import { uploadPublicImage } from '../middleware/upload.middleware';
import { uploadImageToStorage } from '../utils/supabaseStorage.util';

const router = Router();

// Protected admin upload for public media (products, services, banners, before/after, blog)
router.post(
  '/admin-image',
  authenticateAdmin,
  uploadPublicImage.single('image'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'কোনো ফাইল আপলোড করা হয়নি।' });
      }

      const result = await uploadImageToStorage({
        fileBuffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        bucketName: process.env.SUPABASE_STORAGE_BUCKET || 'product-images',
        folder: 'products',
      });

      return res.json({
        success: true,
        message: 'ছবি সফলভাবে আপলোড হয়েছে।',
        data: {
          url: result.url,
          filename: result.filename,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
      });
    } catch (err: any) {
      console.error('Admin image upload error:', err);
      const userMessage = err.message?.includes('Supabase')
        ? `ছবি আপলোড ব্যর্থ হয়েছে: ${err.message}`
        : 'ছবি আপলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
      return res.status(500).json({ success: false, message: userMessage });
    }
  }
);

export default router;
