import { Router } from 'express';
import { submitContactMessage } from '../controllers/contact.controller';
import { contactLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/', contactLimiter, submitContactMessage);

export default router;
