import { NextRequest, NextResponse } from 'next/server';
import { getTags, saveTags } from '@/lib/storage';
import { Tag } from '@/types/note';

export async function GET() {
  try {
    const tags = getTags();
    return NextResponse.json({ success: true, tags });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ success: false, error: 'Tag name is required' }, { status: 400 });
    }

    const tags = getTags();
    const existing = tags.find((t) => t.name.toLowerCase() === body.name.trim().toLowerCase());
    if (existing) {
      return NextResponse.json({ success: true, tag: existing, isExisting: true });
    }

    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name: body.name.trim(),
      color: body.color || '#3b82f6',
    };

    tags.push(newTag);
    saveTags(tags);

    return NextResponse.json({ success: true, tag: newTag }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to create tag' }, { status: 500 });
  }
}
