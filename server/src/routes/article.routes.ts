import { Router } from 'express';
import { getArticles, getArticleBySlug, getArticleCategories } from '../controllers/article.controller';

const router = Router();

router.get('/', getArticles);
router.get('/categories', getArticleCategories);
router.get('/:slug', getArticleBySlug);

export default router;
