import { Router } from 'express';
import { submitConsultation, getCustomerConsultations } from '../controllers/consultation.controller';
import { optionalAuthenticateUser, authenticateUser } from '../middleware/auth.middleware';
import { uploadConsultationImage } from '../middleware/upload.middleware';
import { consultationLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.post(
  '/',
  consultationLimiter,
  optionalAuthenticateUser,
  uploadConsultationImage.array('images', 4),
  submitConsultation
);

router.get('/my-consultations', authenticateUser, getCustomerConsultations);

export default router;
