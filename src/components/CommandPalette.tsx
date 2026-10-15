'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Moon, 
  Sun, 
  RotateCcw, 
  FileText, 
  Pin, 
  Star, 
  CheckSquare, 
  Archive, 
  Trash2,
  X,
  Command
} from 'lucide-react';
import { Note, ViewFilter } from '@/types/note';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onSelectNote: (note: Note) => void;
  onNewNote: () => void;
  onSelectView: (view: ViewFilter) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onResetDemo: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  notes,
  onSelectNote,
  onNewNote,
  onSelectView,
  isDarkMode,
  onToggleDarkMode,
  onResetDemo,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or shortcut
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredNotes = query.trim()
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(query.toLowerCase()) ||
          n.content.toLowerCase().includes(query.toLowerCase()) ||
          n.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : notes.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-scale-up">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search notes..."
            className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {/* Quick Actions */}
          {!query && (
            <div>
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Quick Actions
              </span>
              <div className="mt-1 space-y-0.5">
                <button
                  onClick={() => {
                    onNewNote();
                    onClose();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Plus className="w-4 h-4 text-amber-500" />
                  <span>Create New Note</span>
                </button>
                <button
                  onClick={() => {
                    onToggleDarkMode();
                    onClose();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-500" />
                  )}
                  <span>Switch to {isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button
                  onClick={() => {
                    onResetDemo();
                    onClose();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-emerald-500" />
                  <span>Reset Demo Notes</span>
                </button>
              </div>
            </div>
          )}

          {/* Notes Found */}
          <div>
            <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              {query ? `Matching Notes (${filteredNotes.length})` : 'Recent Notes'}
            </span>
            <div className="mt-1 space-y-0.5">
              {filteredNotes.length === 0 ? (
                <div className="py-4 text-center text-xs text-zinc-400">
                  No notes found matching &quot;{query}&quot;
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      onSelectNote(note);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span>{note.icon || '📝'}</span>
                      <span className="font-semibold truncate">
                        {note.title || 'Untitled Note'}
                      </span>
                    </span>
                    {note.tags.length > 0 && (
                      <span className="text-[10px] font-mono text-zinc-400">
                        #{note.tags[0]}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
          <span>Navigate with mouse or arrows</span>
          <span>
            <kbd className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">ESC</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};
