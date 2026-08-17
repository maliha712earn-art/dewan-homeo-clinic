import { Router, Request, Response } from 'express';
import { authenticateAdmin } from '../middleware/adminAuth.middleware';
import { uploadPublicImage } from '../middleware/upload.middleware';

const router = Router();

// Protected admin upload for public media (products, services, banners, before/after, blog)
router.post(
  '/admin-image',
  authenticateAdmin,
  uploadPublicImage.single('image'),
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'কোনো ফাইল আপলোড করা হয়নি।' });
    }

    const publicUrl = `/uploads/public/${req.file.filename}`;
    return res.json({
      success: true,
      message: 'ছবি সফলভাবে আপলোড হয়েছে।',
      data: {
        url: publicUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  }
);

export default router;
