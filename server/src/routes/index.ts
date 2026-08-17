import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import serviceRoutes from './service.routes';
import orderRoutes from './order.routes';
import consultationRoutes from './consultation.routes';
import beforeAfterRoutes from './beforeAfter.routes';
import articleRoutes from './article.routes';
import contactRoutes from './contact.routes';
import settingsRoutes from './settings.routes';
import adminRoutes from './admin.routes';
import uploadRoutes from './upload.routes';
import prisma from '../config/db';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/services', serviceRoutes);
router.use('/orders', orderRoutes);
router.use('/consultations', consultationRoutes);
router.use('/before-after', beforeAfterRoutes);
router.use('/articles', articleRoutes);
router.use('/blog', articleRoutes);
router.use('/contact', contactRoutes);
router.use('/settings', settingsRoutes);
router.use('/upload', uploadRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err: any) {
    dbStatus = 'error: ' + (err?.message || 'cannot connect');
  }

  res.json({
    status: dbStatus === 'connected' ? 'OK' : 'DEGRADED',
    service: 'দেওয়ান হোমিও ক্লিনিক REST API',
    clinicName: 'দেওয়ান হোমিও ক্লিনিক (Deowan Homeo Clinic)',
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    version: '1.0.0',
  });
});

export default router;
