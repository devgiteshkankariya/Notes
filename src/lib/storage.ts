import fs from 'fs';
import path from 'path';
import { Note, Tag } from '@/types/note';

const DATA_DIR = path.join(process.cwd(), 'data');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');
const TAGS_FILE = path.join(DATA_DIR, 'tags.json');

const INITIAL_TAGS: Tag[] = [
  { id: 'work', name: 'Work', color: '#3b82f6' },
  { id: 'personal', name: 'Personal', color: '#ec4899' },
  { id: 'ideas', name: 'Ideas', color: '#f59e0b' },
  { id: 'code', name: 'Code', color: '#10b981' },
  { id: 'todo', name: 'To-Do', color: '#8b5cf6' },
];

const INITIAL_NOTES: Note[] = [
  {
    id: 'note-welcome',
    title: 'Welcome to NoteKeep Studio 🚀',
    content: `## The Best of Google Keep & Notion Combined
- **Vibrant Card Themes**: Switch between pastel, neon, obsidian, and gradient aesthetics.
- **Notion-Style Block Formatting**: Headers, task lists, code snippets, and callouts.
- **Lightning Fast Quick Capture**: Add notes from the top bar with colors and tags.
- **Flexible Views**: Switch between Grid Masonry, Compact List, and Notion-style Board view.

\`\`\`typescript
const isAmazing = true;
console.log("Welcome to your new favorite workspace!");
\`\`\`

> 💡 *Pro tip: Try pressing \`Ctrl+K\` (or \`Cmd+K\`) to search anywhere or toggle Dark Mode.*`,
    theme: 'mint',
    icon: '🚀',
    coverImage: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    tags: ['Ideas', 'Work'],
    checklist: [
      { id: 'chk-1', text: 'Explore the 14+ note themes and color palettes', completed: true },
      { id: 'chk-2', text: 'Create your first note using the quick bar', completed: false },
      { id: 'chk-3', text: 'Toggle dark mode in the sidebar', completed: false },
      { id: 'chk-4', text: 'Try switching between Grid, List, and Kanban views', completed: false },
    ],
    isPinned: true,
    isFavorite: true,
    isArchived: false,
    isTrashed: false,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-q4-roadmap',
    title: 'Product Roadmap & Sprint Goals 🎯',
    content: `### High Priority Deliverables
Focusing on developer velocity and user satisfaction for the upcoming release cycle.

#### Key Milestones
1. Refactor data sync layer to support offline queues
2. Introduce custom markdown slash command menu
3. Expand color token customization in user settings`,
    theme: 'peach',
    icon: '🎯',
    coverImage: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    tags: ['Work', 'To-Do'],
    checklist: [
      { id: 'chk-201', text: 'Finalize API schema and validation rules', completed: true },
      { id: 'chk-202', text: 'Complete drag-and-drop board interaction', completed: true },
      { id: 'chk-203', text: 'Run accessibility and contrast audit', completed: false },
      { id: 'chk-204', text: 'Write release notes and changelog', completed: false },
    ],
    isPinned: true,
    isFavorite: false,
    isArchived: false,
    isTrashed: false,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-deep-work',
    title: 'Deep Work & Morning Rituals ☕',
    content: `*"Clarity about what matters provides clarity about what does not."*

### Daily Routine
- **07:30 AM**: 20-min morning walk + hydration
- **08:00 AM**: Pour-over coffee + 90-minute distraction-free focus block
- **11:30 AM**: Team standup & code reviews
- **04:30 PM**: Wrap-up log & planning next day's top 3 outcomes`,
    theme: 'lavender',
    icon: '☕',
    tags: ['Personal'],
    checklist: [],
    isPinned: false,
    isFavorite: true,
    isArchived: false,
    isTrashed: false,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-canary-design',
    title: 'Design System & Color Harmonies 🎨',
    content: `### Google Keep Inspiration
The magic of Keep is the **instant cognitive grouping** created by soft, harmonious hues. Each color represents a mindset:
- 🟡 Yellow: Actionable to-dos & urgent thoughts
- 🟢 Green: Growth, research, reading notes
- 🟣 Purple: Creative brainstorms & long-term dreams
- 🔴 Rose / Peach: People, team syncs, meetings`,
    theme: 'canary',
    icon: '🎨',
    tags: ['Ideas', 'Design'],
    checklist: [
      { id: 'chk-301', text: 'Test contrast ratios for dark mode cards', completed: true },
      { id: 'chk-302', text: 'Add subtle colored borders for high visibility', completed: true },
      { id: 'chk-303', text: 'Ensure smooth hover transitions on all cards', completed: true },
    ],
    isPinned: false,
    isFavorite: false,
    isArchived: false,
    isTrashed: false,
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-reading-list',
    title: 'Winter Reading List 📚',
    content: `Essential books on software architecture, design, and thoughtful craft:
- **Designing Data-Intensive Applications** — Martin Kleppmann
- **The Design of Everyday Things** — Don Norman
- **Refactoring UI** — Adam Wathan & Steve Schoger
- **Thinking in Systems** — Donella Meadows`,
    theme: 'sky',
    icon: '📚',
    tags: ['Personal'],
    checklist: [
      { id: 'chk-401', text: 'Finish Chapter 4 of Data-Intensive Apps', completed: true },
      { id: 'chk-402', text: 'Take notes on System Archetypes', completed: false },
    ],
    isPinned: false,
    isFavorite: false,
    isArchived: false,
    isTrashed: false,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-tech-stack',
    title: 'Architecture & Tech Stack ⚡',
    content: `### Core Foundation
- **Framework**: Next.js 15 App Router
- **Type Safety**: TypeScript 5.7
- **Styling**: Tailwind CSS + Custom Design System Tokens
- **Icons**: Lucide React
- **Full-Stack Storage**: Local persistent file database with atomic sync`,
    theme: 'obsidian',
    icon: '⚡',
    coverImage: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    tags: ['Code', 'Work'],
    checklist: [],
    isPinned: false,
    isFavorite: true,
    isArchived: false,
    isTrashed: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getNotes(): Note[] {
  ensureDataDir();
  if (!fs.existsSync(NOTES_FILE)) {
    saveNotes(INITIAL_NOTES);
    return INITIAL_NOTES;
  }
  try {
    const raw = fs.readFileSync(NOTES_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveNotes(INITIAL_NOTES);
      return INITIAL_NOTES;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading notes.json:', err);
    return INITIAL_NOTES;
  }
}

export function saveNotes(notes: Note[]): void {
  ensureDataDir();
  const tmpFile = `${NOTES_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(notes, null, 2), 'utf-8');
  fs.renameSync(tmpFile, NOTES_FILE);
}

export function getTags(): Tag[] {
  ensureDataDir();
  if (!fs.existsSync(TAGS_FILE)) {
    saveTags(INITIAL_TAGS);
    return INITIAL_TAGS;
  }
  try {
    const raw = fs.readFileSync(TAGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveTags(INITIAL_TAGS);
      return INITIAL_TAGS;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading tags.json:', err);
    return INITIAL_TAGS;
  }
}

export function saveTags(tags: Tag[]): void {
  ensureDataDir();
  const tmpFile = `${TAGS_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(tags, null, 2), 'utf-8');
  fs.renameSync(tmpFile, TAGS_FILE);
}

export function resetSeedData(): { notes: Note[]; tags: Tag[] } {
  saveNotes(INITIAL_NOTES);
  saveTags(INITIAL_TAGS);
  return { notes: INITIAL_NOTES, tags: INITIAL_TAGS };
}
