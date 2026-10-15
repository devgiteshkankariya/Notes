'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Note, Tag, NoteThemeId } from '@/types/note';
import { NoteCard } from './NoteCard';

interface KanbanBoardProps {
  notes: Note[];
  tags: Tag[];
  onOpenEdit: (note: Note) => void;
  onTogglePin: (id: string, current: boolean) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onToggleArchive: (id: string, current: boolean) => void;
  onDelete: (id: string, isPermanent: boolean) => void;
  onRestoreFromTrash?: (id: string) => void;
  onChangeTheme: (id: string, theme: NoteThemeId) => void;
  onToggleChecklist: (noteId: string, itemId: string) => void;
  onDuplicate: (note: Note) => void;
  onQuickAddWithTag: (tag: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  notes,
  tags,
  onOpenEdit,
  onTogglePin,
  onToggleFavorite,
  onToggleArchive,
  onDelete,
  onRestoreFromTrash,
  onChangeTheme,
  onToggleChecklist,
  onDuplicate,
  onQuickAddWithTag,
}) => {
  // Columns based on tags + 1 column for Untagged
  const columns = [
    ...tags.map((t) => ({
      id: t.name,
      title: `#${t.name}`,
      color: t.color,
      notes: notes.filter((n) => n.tags.some((tag) => tag.toLowerCase() === t.name.toLowerCase())),
    })),
    {
      id: 'General',
      title: 'General / Untagged',
      color: '#71717a',
      notes: notes.filter((n) => !n.tags || n.tags.length === 0),
    },
  ];

  return (
    <div className="w-full overflow-x-auto pb-8 pt-2">
      <div className="flex items-start gap-4 min-w-max px-2">
        {columns.map((column) => (
          <div
            key={column.id}
            className="w-80 shrink-0 rounded-2xl bg-zinc-200/50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 p-3 flex flex-col max-h-[calc(100vh-12rem)]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <h4 className="font-heading font-black text-xs text-zinc-800 dark:text-zinc-200">
                  {column.title}
                </h4>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-300/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {column.notes.length}
                </span>
              </div>

              <button
                onClick={() => onQuickAddWithTag(column.id === 'General' ? '' : column.id)}
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-300/50 dark:hover:bg-zinc-800"
                title={`Add note to ${column.title}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Column Cards List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
              {column.notes.length === 0 ? (
                <div className="py-8 text-center text-zinc-400 dark:text-zinc-600 text-xs italic">
                  No notes in this group
                </div>
              ) : (
                column.notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onOpenEdit={onOpenEdit}
                    onTogglePin={onTogglePin}
                    onToggleFavorite={onToggleFavorite}
                    onToggleArchive={onToggleArchive}
                    onDelete={onDelete}
                    onRestoreFromTrash={onRestoreFromTrash}
                    onChangeTheme={onChangeTheme}
                    onToggleChecklist={onToggleChecklist}
                    onDuplicate={onDuplicate}
                    layoutMode="grid"
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
