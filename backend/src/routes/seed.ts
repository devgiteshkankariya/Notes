import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { optionalAuthMiddleware } from '../middleware/auth.js';
import { seedUserData } from './auth.js';

const router = Router();

async function resolveUserId(req: Request): Promise<string> {
  if (req.user && req.user.id) {
    return req.user.id;
  }
  const demoEmail = 'demo@notekeep.local';
  let demoUser = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        email: demoEmail,
        password: 'demouserhashpassword',
        name: 'Demo User',
      },
    });
  }
  return demoUser.id;
}

// POST /api/seed
router.post('/', optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);

    // Reset notes for this user
    await prisma.note.deleteMany({ where: { userId } });
    await prisma.tag.deleteMany({ where: { userId } });

    await seedUserData(userId);

    return res.json({ success: true, message: 'Sample workspace notes and tags restored!' });
  } catch (err: any) {
    console.error('Seed error:', err);
    return res.status(500).json({ success: false, error: 'Failed to reset and seed notes' });
  }
});

export default router;
