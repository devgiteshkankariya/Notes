import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { optionalAuthMiddleware } from '../middleware/auth.js';
import { seedUserData } from './auth.js';

const router = Router();

// Helper to get or create default user if unauthenticated
async function resolveUserId(req: Request): Promise<string> {
  if (req.user && req.user.id) {
    return req.user.id;
  }

  // Ensure default demo user exists for seamless unauthenticated use
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
    await seedUserData(demoUser.id);
  }

  return demoUser.id;
}

// Helper to deserialize note JSON fields
function formatNote(note: any) {
  let tags: string[] = [];
  let checklist: any[] = [];

  try {
    tags = typeof note.tags === 'string' ? JSON.parse(note.tags) : note.tags || [];
  } catch {
    tags = [];
  }

  try {
    checklist = typeof note.checklist === 'string' ? JSON.parse(note.checklist) : note.checklist || [];
  } catch {
    checklist = [];
  }

  return {
    ...note,
    tags,
    checklist,
    createdAt: note.createdAt instanceof Date ? note.createdAt.toISOString() : note.createdAt,
    updatedAt: note.updatedAt instanceof Date ? note.updatedAt.toISOString() : note.updatedAt,
    trashedAt: note.trashedAt instanceof Date ? note.trashedAt.toISOString() : note.trashedAt,
  };
}

// GET /api/notes
router.get('/', optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    const view = (req.query.view as string) || 'all';
    const tag = req.query.tag as string;
    const search = ((req.query.search as string) || '').toLowerCase().trim();

    const whereClause: any = { userId };

    if (view === 'trash') {
      whereClause.isTrashed = true;
    } else {
      whereClause.isTrashed = false;
      if (view === 'archive') {
        whereClause.isArchived = true;
      } else {
        whereClause.isArchived = false;
        if (view === 'pinned') {
          whereClause.isPinned = true;
        } else if (view === 'favorites') {
          whereClause.isFavorite = true;
        }
      }
    }

    const rawNotes = await prisma.note.findMany({
      where: whereClause,
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    let notes = rawNotes.map(formatNote);

    // Filter checklists view in memory
    if (view === 'checklists') {
      notes = notes.filter((n) => n.checklist && n.checklist.length > 0);
    }

    // Filter by tag in memory (tags are stored as JSON)
    if (tag && tag !== 'all') {
      notes = notes.filter((n) =>
        n.tags.some((t: string) => t.toLowerCase() === tag.toLowerCase())
      );
    }

    // Filter by search query
    if (search) {
      notes = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(search) ||
          n.content.toLowerCase().includes(search) ||
          n.tags.some((t: string) => t.toLowerCase().includes(search)) ||
          n.checklist.some((c: any) => c.text.toLowerCase().includes(search))
      );
    }

    return res.json({ success: true, notes });
  } catch (err: any) {
    console.error('Fetch notes error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch notes' });
  }
});

// POST /api/notes
router.post('/', optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    const body = req.body;

    if (!body.title && !body.content && (!body.checklist || body.checklist.length === 0)) {
      return res.status(400).json({ success: false, error: 'Note must contain a title, content, or checklist' });
    }

    const tagsJson = JSON.stringify(Array.isArray(body.tags) ? body.tags : []);
    const checklistJson = JSON.stringify(Array.isArray(body.checklist) ? body.checklist : []);

    const created = await prisma.note.create({
      data: {
        title: body.title || '',
        content: body.content || '',
        theme: body.theme || 'default',
        icon: body.icon || null,
        coverImage: body.coverImage || null,
        tags: tagsJson,
        checklist: checklistJson,
        isPinned: Boolean(body.isPinned),
        isFavorite: Boolean(body.isFavorite),
        isArchived: Boolean(body.isArchived),
        isTrashed: false,
        userId,
      },
    });

    return res.status(201).json({ success: true, note: formatNote(created) });
  } catch (err: any) {
    console.error('Create note error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create note' });
  }
});

// GET /api/notes/:id
router.get('/:id', optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    const { id } = req.params;

    const note = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    return res.json({ success: true, note: formatNote(note) });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch note' });
  }
});

// PUT /api/notes/:id
router.put('/:id', optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    const { id } = req.params;
    const body = req.body;

    const existing = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.theme !== undefined) updateData.theme = body.theme;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
    if (body.isPinned !== undefined) updateData.isPinned = Boolean(body.isPinned);
    if (body.isFavorite !== undefined) updateData.isFavorite = Boolean(body.isFavorite);
    if (body.isArchived !== undefined) updateData.isArchived = Boolean(body.isArchived);
    if (body.isTrashed !== undefined) {
      updateData.isTrashed = Boolean(body.isTrashed);
      updateData.trashedAt = body.isTrashed ? new Date() : null;
    }

    if (body.tags !== undefined) {
      updateData.tags = JSON.stringify(Array.isArray(body.tags) ? body.tags : []);
    }
    if (body.checklist !== undefined) {
      updateData.checklist = JSON.stringify(Array.isArray(body.checklist) ? body.checklist : []);
    }

    const updated = await prisma.note.update({
      where: { id },
      data: updateData,
    });

    return res.json({ success: true, note: formatNote(updated) });
  } catch (err: any) {
    console.error('Update note error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update note' });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    const { id } = req.params;
    const permanent = req.query.permanent === 'true';

    const existing = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    if (permanent || existing.isTrashed) {
      // Hard delete from database
      await prisma.note.delete({ where: { id } });
      return res.json({ success: true, message: 'Note permanently deleted' });
    } else {
      // Soft delete to trash
      const trashed = await prisma.note.update({
        where: { id },
        data: {
          isTrashed: true,
          trashedAt: new Date(),
          isPinned: false,
        },
      });
      return res.json({ success: true, note: formatNote(trashed), message: 'Note moved to trash' });
    }
  } catch (err: any) {
    console.error('Delete note error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete note' });
  }
});

export default router;
