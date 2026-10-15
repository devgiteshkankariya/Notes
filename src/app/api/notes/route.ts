import { NextRequest, NextResponse } from 'next/server';
import { getNotes, saveNotes } from '@/lib/storage';
import { Note } from '@/types/note';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'all';
    const tag = searchParams.get('tag');
    const search = searchParams.get('search')?.toLowerCase().trim() || '';

    let notes = getNotes();

    // Filter by view
    if (view === 'trash') {
      notes = notes.filter((n) => n.isTrashed);
    } else {
      // All other views exclude trashed notes
      notes = notes.filter((n) => !n.isTrashed);

      if (view === 'archive') {
        notes = notes.filter((n) => n.isArchived);
      } else {
        // 'all', 'pinned', 'favorites', 'checklists' exclude archived
        notes = notes.filter((n) => !n.isArchived);

        if (view === 'pinned') {
          notes = notes.filter((n) => n.isPinned);
        } else if (view === 'favorites') {
          notes = notes.filter((n) => n.isFavorite);
        } else if (view === 'checklists') {
          notes = notes.filter((n) => n.checklist && n.checklist.length > 0);
        }
      }
    }

    // Filter by tag
    if (tag && tag !== 'all') {
      notes = notes.filter((n) =>
        n.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
      );
    }

    // Filter by search query
    if (search) {
      notes = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(search) ||
          n.content.toLowerCase().includes(search) ||
          n.tags.some((t) => t.toLowerCase().includes(search)) ||
          n.checklist.some((c) => c.text.toLowerCase().includes(search))
      );
    }

    // Sort: Pinned first (if in active views), then newest updated
    notes.sort((a, b) => {
      if (view !== 'archive' && view !== 'trash') {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return NextResponse.json({ success: true, notes, count: notes.length });
  } catch (err) {
    console.error('API Error in GET /api/notes:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const notes = getNotes();

    const newNote: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: body.title || '',
      content: body.content || '',
      theme: body.theme || 'default',
      icon: body.icon || undefined,
      coverImage: body.coverImage || undefined,
      tags: Array.isArray(body.tags) ? body.tags : [],
      checklist: Array.isArray(body.checklist) ? body.checklist : [],
      isPinned: Boolean(body.isPinned),
      isFavorite: Boolean(body.isFavorite),
      isArchived: false,
      isTrashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    notes.unshift(newNote);
    saveNotes(notes);

    return NextResponse.json({ success: true, note: newNote }, { status: 201 });
  } catch (err) {
    console.error('API Error in POST /api/notes:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
