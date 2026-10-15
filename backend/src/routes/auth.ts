import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'notekeep_secure_jwt_secret_dev_key_2026';

const INITIAL_TAGS = [
  { name: 'Work', color: '#3b82f6' },
  { name: 'Personal', color: '#ec4899' },
  { name: 'Ideas', color: '#f59e0b' },
  { name: 'Code', color: '#10b981' },
  { name: 'To-Do', color: '#8b5cf6' },
];

export async function seedUserData(userId: string) {
  // Check if tags exist for user
  const existingTags = await prisma.tag.count({ where: { userId } });
  if (existingTags === 0) {
    for (const tag of INITIAL_TAGS) {
      await prisma.tag.create({
        data: {
          name: tag.name,
          color: tag.color,
          userId,
        },
      });
    }
  }

  // Check if notes exist for user
  const existingNotes = await prisma.note.count({ where: { userId } });
  if (existingNotes === 0) {
    await prisma.note.create({
      data: {
        title: 'Welcome to NoteKeep Studio 🚀',
        content: `## The Best of Google Keep & Notion Combined
- **Full Backend Integration**: Your data is securely saved in SQLite with user-level isolation.
- **Vibrant Card Themes**: Switch between pastel, neon, obsidian, and gradient aesthetics.
- **Notion-Style Block Formatting**: Headers, task lists, code snippets, and callouts.
- **Lightning Fast Quick Capture**: Add notes from the top bar with colors and tags.
- **Flexible Views**: Switch between Grid Masonry, Compact List, and Kanban Board.

\`\`\`typescript
const status = "Decoupled Architecture Live!";
console.log("Frontend + Express Backend + SQLite working smoothly!");
\`\`\`

> 💡 *Pro tip: Try pressing \`Ctrl+K\` (or \`Cmd+K\`) to search anywhere or switch views.*`,
        theme: 'mint',
        icon: '🚀',
        coverImage: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        tags: JSON.stringify(['Ideas', 'Work']),
        checklist: JSON.stringify([
          { id: 'chk-1', text: 'Sign in to access your private notes', completed: true },
          { id: 'chk-2', text: 'Create your first note using the quick creator', completed: false },
          { id: 'chk-3', text: 'Toggle dark mode in the sidebar', completed: false },
          { id: 'chk-4', text: 'Try switching between Grid, List, and Kanban views', completed: false },
        ]),
        isPinned: true,
        isFavorite: true,
        userId,
      },
    });

    await prisma.note.create({
      data: {
        title: 'Product Roadmap & Sprint Goals 🎯',
        content: `### High Priority Deliverables
Focusing on developer velocity and user satisfaction for the upcoming release cycle.

#### Key Milestones
1. Refactor data sync layer to support dedicated Express backend
2. Implement secure SQLite persistence with Prisma ORM
3. Support multi-user accounts and session tokens`,
        theme: 'peach',
        icon: '🎯',
        tags: JSON.stringify(['Work']),
        checklist: JSON.stringify([
          { id: 'chk-5', text: 'Separate frontend from backend', completed: true },
          { id: 'chk-6', text: 'Add user authentication & SQLite persistence', completed: true },
          { id: 'chk-7', text: 'Verify cross-origin REST API requests', completed: false },
        ]),
        isPinned: true,
        isFavorite: false,
        userId,
      },
    });
  }
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name ? name.trim() : normalizedEmail.split('@')[0],
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Seed default notes & tags for new user
    await seedUserData(user.id);

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(201).json({
      success: true,
      token,
      user,
      message: 'Account created successfully',
    });
  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create account' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      message: 'Logged in successfully',
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Failed to log in' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

export default router;
