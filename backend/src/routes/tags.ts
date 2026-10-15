import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { optionalAuthMiddleware } from '../middleware/auth.js';

const router = Router();

async function resolveUserId(req: Request): Promise<string> {
  if (req.user && req.user.id) {
    return req.user.id;
  }
  const demoEmail = 'demo@notekeep.local';
  const demoUser = await prisma.user.findUnique({ where: { email: demoEmail } });
  return demoUser ? demoUser.id : '';
}

// GET /api/tags
router.get('/', optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);

    const tags = await prisma.tag.findMany({
      where: {
        OR: [
          { userId },
          { userId: null },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    return res.json({ success: true, tags });
  } catch (err: any) {
    console.error('Fetch tags error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch tags' });
  }
});

// POST /api/tags
router.post('/', optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    const { name, color } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, error: 'Tag name is required' });
    }

    const trimmedName = name.trim();

    // Check for duplicate tag for this user
    const existing = await prisma.tag.findFirst({
      where: {
        name: trimmedName,
        userId,
      },
    });

    if (existing) {
      return res.json({ success: true, tag: existing, isExisting: true });
    }

    const created = await prisma.tag.create({
      data: {
        name: trimmedName,
        color: color || '#3b82f6',
        userId: userId || null,
      },
    });

    return res.status(201).json({ success: true, tag: created });
  } catch (err: any) {
    console.error('Create tag error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create tag' });
  }
});

export default router;
