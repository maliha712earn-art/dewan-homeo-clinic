import { Router } from 'express';
import {
  adminLogin,
  getAdminMe,
  listAdminUsers,
  createAdminUser,
  toggleAdminStatus,
} from '../controllers/adminAuth.controller';
import {
  getDashboardStats,
  getOrdersAdmin,
  getOrderByIdAdmin,
  updateOrderStatusAdmin,
  updateOrderNotesAdmin,
  getConsultationsAdmin,
  updateConsultationStatusAdmin,
  getProductsAdmin,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  getServicesAdmin,
  createServiceAdmin,
  updateServiceAdmin,
  deleteServiceAdmin,
  getBeforeAfterAdmin,
  createBeforeAfterAdmin,
  updateBeforeAfterAdmin,
  deleteBeforeAfterAdmin,
  getArticlesAdmin,
  createArticleAdmin,
  updateArticleAdmin,
  deleteArticleAdmin,
  getCustomersAdmin,
  getCustomerDetailAdmin,
  getMessagesAdmin,
  updateMessageStatusAdmin,
  deleteMessageAdmin,
  getSettingsAdmin,
  updateSettingsAdmin,
  getAuditLogsAdmin,
} from '../controllers/admin.controller';
import { getCategories } from '../controllers/product.controller';
import uploadRoutes from './upload.routes';
import { authenticateAdmin, requireSuperAdmin } from '../middleware/adminAuth.middleware';
import { authLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Public Admin Auth
router.post('/login', authLimiter, adminLogin);

// Protected Admin Routes
router.use(authenticateAdmin);

// Uploads under /admin/upload
router.use('/upload', uploadRoutes);

// Categories
router.get('/categories', getCategories);

// Admin Profile & User Management
router.get('/me', getAdminMe);
router.get('/users', requireSuperAdmin, listAdminUsers);
router.post('/users', requireSuperAdmin, createAdminUser);
router.patch('/users/:id/status', requireSuperAdmin, toggleAdminStatus);

// Dashboard
router.get('/dashboard-stats', getDashboardStats);

// Orders
router.get('/orders', getOrdersAdmin);
router.get('/orders/:id', getOrderByIdAdmin);
router.patch('/orders/:id/status', updateOrderStatusAdmin);
router.patch('/orders/:id/notes', updateOrderNotesAdmin);

// Consultations
router.get('/consultations', getConsultationsAdmin);
router.patch('/consultations/:id', updateConsultationStatusAdmin);

// Products
router.get('/products', getProductsAdmin);
router.post('/products', createProductAdmin);
router.put('/products/:id', updateProductAdmin);
router.delete('/products/:id', deleteProductAdmin);

// Services
router.get('/services', getServicesAdmin);
router.post('/services', createServiceAdmin);
router.put('/services/:id', updateServiceAdmin);
router.delete('/services/:id', deleteServiceAdmin);

// Before & After
router.get('/before-after', getBeforeAfterAdmin);
router.post('/before-after', createBeforeAfterAdmin);
router.put('/before-after/:id', updateBeforeAfterAdmin);
router.delete('/before-after/:id', deleteBeforeAfterAdmin);

// Articles
router.get('/articles', getArticlesAdmin);
router.post('/articles', createArticleAdmin);
router.put('/articles/:id', updateArticleAdmin);
router.delete('/articles/:id', deleteArticleAdmin);

// Customers
router.get('/customers', getCustomersAdmin);
router.get('/customers/:id', getCustomerDetailAdmin);

// Messages
router.get('/messages', getMessagesAdmin);
router.patch('/messages/:id', updateMessageStatusAdmin);
router.delete('/messages/:id', deleteMessageAdmin);

// Settings
router.get('/settings', getSettingsAdmin);
router.put('/settings', updateSettingsAdmin);

// Audit Logs
router.get('/audit-logs', getAuditLogsAdmin);

export default router;
