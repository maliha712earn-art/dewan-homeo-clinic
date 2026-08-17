import { Request, Response } from 'express';
import prisma from '../config/db';

export async function getArticles(req: Request, res: Response) {
  try {
    const { category, search, page = '1', limit = '10' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const take = Math.min(30, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * take;

    const where: any = { isPublished: true };

    if (category) {
      where.category = { slug: category as string };
    }

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { titleBn: { contains: q } },
        { contentBn: { contains: q } },
        { excerptBn: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          category: { select: { id: true, nameBn: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.article.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        articles,
        pagination: {
          total,
          page: pageNum,
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'আর্টিকেল লোড করা যায়নি।' });
  }
}

export async function getArticleBySlug(req: Request, res: Response) {
  try {
    const slug = req.params.slug as string;
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, nameBn: true, slug: true } },
      },
    });

    if (!article || !article.isPublished) {
      return res.status(404).json({ success: false, message: 'আর্টিকেলটি পাওয়া যায়নি।' });
    }

    // Increment view count asynchronously
    prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    // Recent/Related articles
    const relatedArticles = await prisma.article.findMany({
      where: {
        id: { not: article.id },
        isPublished: true,
      },
      include: {
        category: { select: { nameBn: true, slug: true } },
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      data: { article, relatedArticles },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'আর্টিকেলের তথ্য লোড করা যায়নি।' });
  }
}

export async function getArticleCategories(req: Request, res: Response) {
  try {
    const categories = await prisma.articleCategory.findMany({
      include: {
        _count: { select: { articles: { where: { isPublished: true } } } },
      },
      orderBy: { nameBn: 'asc' },
    });

    return res.json({ success: true, data: categories });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'ক্যাটাগরি লোড করা যায়নি।' });
  }
}
