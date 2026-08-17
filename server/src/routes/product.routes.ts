import { Router } from 'express';
import { getProducts, getProductBySlug, getCategories } from '../controllers/product.controller';

const router = Router();

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:slug', getProductBySlug);

export default router;
