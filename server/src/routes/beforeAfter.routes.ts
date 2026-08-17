import { Router } from 'express';
import { getBeforeAfterCases } from '../controllers/beforeAfter.controller';

const router = Router();

router.get('/', getBeforeAfterCases);

export default router;
