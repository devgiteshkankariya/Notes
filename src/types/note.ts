export type NoteThemeId =
  | 'default'
  | 'peach'
  | 'sage'
  | 'mint'
  | 'lavender'
  | 'canary'
  | 'rose'
  | 'sky'
  | 'amber'
  | 'emerald'
  | 'indigo'
  | 'obsidian'
  | 'sunset'
  | 'aurora';

export interface NoteTheme {
  id: NoteThemeId;
  name: string;
  bgLight: string;
  bgDark: string;
  cardLight: string;
  cardDark: string;
  borderLight: string;
  borderDark: string;
  textLight: string;
  textDark: string;
  accent: string;
  previewColor: string;
  gradient?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string; // Markdown supported
  theme: NoteThemeId;
  icon?: string; // Emoji
  coverImage?: string; // Header banner url or preset gradient
  tags: string[];
  checklist: ChecklistItem[];
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  createdAt: string;
  updatedAt: string;
  trashedAt?: string;
}

export type ViewFilter = 'all' | 'pinned' | 'favorites' | 'checklists' | 'archive' | 'trash';

export type LayoutMode = 'grid' | 'list' | 'board';

export interface Tag {
  id: string;
  name: string;
  color: string;
}
