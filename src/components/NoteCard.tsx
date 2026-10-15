'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Pin, 
  Star, 
  Archive, 
  ArchiveRestore, 
  Trash2, 
  RotateCcw, 
  Palette, 
  Copy, 
  ExternalLink,
  Check,
  Tag as TagIcon
} from 'lucide-react';
import { Note, NoteThemeId } from '@/types/note';
import { NOTE_THEMES } from '@/data/themes';
import { renderMarkdown } from '@/utils/markdown';

interface NoteCardProps {
  note: Note;
  onOpenEdit: (note: Note) => void;
  onTogglePin: (id: string, current: boolean) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onToggleArchive: (id: string, current: boolean) => void;
  onDelete: (id: string, isPermanent: boolean) => void;
  onRestoreFromTrash?: (id: string) => void;
  onChangeTheme: (id: string, theme: NoteThemeId) => void;
  onToggleChecklist: (noteId: string, itemId: string) => void;
  onDuplicate: (note: Note) => void;
  layoutMode?: 'grid' | 'list' | 'board';
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onOpenEdit,
  onTogglePin,
  onToggleFavorite,
  onToggleArchive,
  onDelete,
  onRestoreFromTrash,
  onChangeTheme,
  onToggleChecklist,
  onDuplicate,
  layoutMode = 'grid',
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  const themeObj = NOTE_THEMES[note.theme] || NOTE_THEMES.default;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `${note.title}\n\n${note.content}\n${note.checklist.map((c) => `${c.completed ? '[x]' : '[ ]'} ${c.text}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleChecklistClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    onToggleChecklist(note.id, itemId);

    // If this completes all tasks, trigger celebratory confetti!
    const targetItem = note.checklist.find((c) => c.id === itemId);
    const uncompletedOthers = note.checklist.filter((c) => c.id !== itemId && !c.completed);
    if (targetItem && !targetItem.completed && uncompletedOthers.length === 0) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
        });
      } catch (err) {
        // Safe fallback
      }
    }
  };

  const isListMode = layoutMode === 'list';

  return (
    <div
      onClick={() => onOpenEdit(note)}
      className={`group relative rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden shadow-sm hover:shadow-card-hover select-none ${
        themeObj.cardLight
      } ${themeObj.cardDark} ${
        isListMode
          ? 'flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 gap-3'
          : 'flex flex-col justify-between'
      }`}
    >
      {/* Cover Image Banner (Notion Style) */}
      {!isListMode && note.coverImage && (
        <div className="h-16 w-full shrink-0" style={{ background: note.coverImage }} />
      )}

      {/* Card Content Container */}
      <div className={`w-full ${isListMode ? 'flex-1' : 'p-4'}`}>
        {/* Header: Icon, Title, Pin */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-start gap-2 flex-1">
            {note.icon && (
              <span className="text-lg leading-none shrink-0 mt-0.5">
                {note.icon}
              </span>
            )}
            <h3 className="font-heading font-black text-sm sm:text-base leading-snug tracking-tight text-inherit break-words line-clamp-2">
              {note.title || (note.content ? '' : 'Untitled Note')}
            </h3>
          </div>

          {/* Quick Pin Indicator/Button */}
          {!note.isTrashed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(note.id, note.isPinned);
              }}
              className={`p-1 rounded-lg transition-all ${
                note.isPinned
                  ? 'text-teal-700 dark:text-teal-300 opacity-100 bg-teal-100/70 dark:bg-teal-950/60'
                  : 'opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
              title={note.isPinned ? 'Unpin note' : 'Pin note'}
              aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
            >
              <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-teal-700 dark:fill-teal-300' : ''}`} />
            </button>
          )}
        </div>

        {/* Note Markdown Content Preview */}
        {note.content && !isListMode && (
          <div className="text-xs leading-relaxed opacity-90 line-clamp-6 mb-3 font-normal">
            {renderMarkdown(note.content)}
          </div>
        )}

        {/* Checklist Preview */}
        {note.checklist && note.checklist.length > 0 && (
          <div className={`space-y-1 my-2 ${isListMode ? 'hidden sm:block max-w-xs' : ''}`}>
            {note.checklist.slice(0, isListMode ? 2 : 4).map((item) => (
              <div
                key={item.id}
                onClick={(e) => handleChecklistClick(e, item.id)}
                className="flex items-center gap-2 group/check hover:opacity-100 cursor-pointer text-xs"
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  readOnly
                  className="w-3.5 h-3.5 rounded border-zinc-400 text-amber-600 pointer-events-none"
                />
                <span
                  className={`truncate ${
                    item.completed ? 'line-through opacity-50' : 'opacity-90'
                  }`}
                >
                  {item.text}
                </span>
              </div>
            ))}
            {note.checklist.length > (isListMode ? 2 : 4) && (
              <p className="text-[10px] opacity-60 font-medium">
                +{note.checklist.length - (isListMode ? 2 : 4)} more tasks...
              </p>
            )}
          </div>
        )}

        {/* Tag Badges */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {note.tags.map((t) => (
              <span
                key={t}
                className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 opacity-80"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer & Action Bar (Keep Style Hover Toolbar) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`px-3 py-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between transition-opacity ${
          isListMode
            ? 'border-t-0 p-0'
            : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <span className="text-[10px] opacity-50 font-mono">
          {new Date(note.updatedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
        </span>

        {/* Action Buttons */}
        <div className="flex items-center gap-0.5">
          {/* Favorite Toggle */}
          {!note.isTrashed && (
            <button
              onClick={() => onToggleFavorite(note.id, note.isFavorite)}
              className={`p-1 rounded-md transition-colors ${
                note.isFavorite
                  ? 'text-amber-500'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
              title={note.isFavorite ? 'Favorited' : 'Favorite'}
            >
              <Star className={`w-3.5 h-3.5 ${note.isFavorite ? 'fill-amber-500' : ''}`} />
            </button>
          )}

          {/* Color Palette Popover */}
          {!note.isTrashed && (
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                title="Change color theme"
              >
                <Palette className="w-3.5 h-3.5" />
              </button>

              {showColorPicker && (
                <div className="absolute bottom-7 right-0 z-50 p-2 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 grid grid-cols-7 gap-1 w-56">
                  {Object.values(NOTE_THEMES).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onChangeTheme(note.id, t.id);
                        setShowColorPicker(false);
                      }}
                      className={`w-5 h-5 rounded-full border border-black/10 dark:border-white/20 transition-transform hover:scale-110 flex items-center justify-center ${
                        note.theme === t.id ? 'ring-2 ring-amber-500' : ''
                      }`}
                      style={{ background: t.previewColor }}
                      title={t.name}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Duplicate Note */}
          {!note.isTrashed && (
            <button
              onClick={() => onDuplicate(note)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              title="Duplicate note"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Archive / Unarchive */}
          {!note.isTrashed && (
            <button
              onClick={() => onToggleArchive(note.id, note.isArchived)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              title={note.isArchived ? 'Unarchive' : 'Archive'}
            >
              {note.isArchived ? (
                <ArchiveRestore className="w-3.5 h-3.5" />
              ) : (
                <Archive className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Trash / Delete / Restore */}
          {note.isTrashed ? (
            <>
              <button
                onClick={() => onRestoreFromTrash && onRestoreFromTrash(note.id)}
                className="p-1 rounded-md text-emerald-600 hover:text-emerald-700 transition-colors"
                title="Restore note from trash"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(note.id, true)}
                className="p-1 rounded-md text-rose-500 hover:text-rose-700 transition-colors"
                title="Delete permanently"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onDelete(note.id, false)}
              className="p-1 rounded-md text-zinc-400 hover:text-rose-500 transition-colors"
              title="Move to trash"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
