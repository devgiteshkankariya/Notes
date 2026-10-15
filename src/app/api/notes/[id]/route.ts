import { NextRequest, NextResponse } from 'next/server';
import { getNotes, saveNotes } from '@/lib/storage';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const notes = getNotes();
    const note = notes.find((n) => n.id === id);

    if (!note) {
      return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, note });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch note' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const notes = getNotes();
    const index = notes.findIndex((n) => n.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
    }

    const current = notes[index];
    const updatedNote = {
      ...current,
      ...body,
      id: current.id, // Immutable ID
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    };

    notes[index] = updatedNote;
    saveNotes(notes);

    return NextResponse.json({ success: true, note: updatedNote });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    const notes = getNotes();
    const index = notes.findIndex((n) => n.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
    }

    const note = notes[index];

    if (permanent || note.isTrashed) {
      // Hard delete from database
      notes.splice(index, 1);
      saveNotes(notes);
      return NextResponse.json({ success: true, message: 'Note permanently deleted', id });
    } else {
      // Soft delete: move to trash
      notes[index] = {
        ...note,
        isTrashed: true,
        trashedAt: new Date().toISOString(),
        isPinned: false, // Unpin when trashed
        updatedAt: new Date().toISOString(),
      };
      saveNotes(notes);
      return NextResponse.json({ success: true, message: 'Note moved to trash', note: notes[index] });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to delete note' }, { status: 500 });
  }
}
