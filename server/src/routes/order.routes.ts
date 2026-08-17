import { Router } from 'express';
import { createOrder, trackOrder, getCustomerOrders } from '../controllers/order.controller';
import { optionalAuthenticateUser, authenticateUser } from '../middleware/auth.middleware';

const router = Router();

router.post('/', optionalAuthenticateUser, createOrder);
router.get('/track', trackOrder);
router.get('/track/:orderNumber', trackOrder);
router.get('/my-orders', authenticateUser, getCustomerOrders);

export default router;
