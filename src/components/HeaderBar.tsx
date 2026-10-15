'use client';

import React from 'react';
import { 
  Search, 
  Menu, 
  LayoutGrid, 
  List, 
  Kanban, 
  X, 
  Command,
  Sparkles
} from 'lucide-react';
import { LayoutMode, ViewFilter } from '@/types/note';

interface HeaderBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
  currentView: ViewFilter;
  selectedTag: string | null;
  onOpenMobileMenu: () => void;
  onOpenCommandPalette: () => void;
  notesCount: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  searchQuery,
  onSearchChange,
  layoutMode,
  onLayoutModeChange,
  currentView,
  selectedTag,
  onOpenMobileMenu,
  onOpenCommandPalette,
  notesCount,
}) => {
  const getTitle = () => {
    if (selectedTag) return `#${selectedTag}`;
    switch (currentView) {
      case 'pinned':
        return 'Pinned Notes';
      case 'favorites':
        return 'Favorites';
      case 'checklists':
        return 'To-Do Lists';
      case 'archive':
        return 'Archived Notes';
      case 'trash':
        return 'Trash Bin';
      case 'all':
      default:
        return 'All Notes';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#f8fafc]/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu + View Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 lg:hidden"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-black text-lg sm:text-xl text-zinc-900 dark:text-zinc-50 tracking-tight">
                {getTitle()}
              </h2>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {notesCount}
              </span>
            </div>
            {selectedTag && (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Filtered by label
              </p>
            )}
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl mx-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search notes, tags, or to-dos..."
              className="w-full pl-9 pr-16 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onOpenCommandPalette}
                className="hidden sm:flex absolute right-2.5 items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60"
                title="Command Palette"
              >
                <Command className="w-3 h-3" /> K
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Layout Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-200/60 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
          <button
            onClick={() => onLayoutModeChange('grid')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              layoutMode === 'grid'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
            title="Grid view (Google Keep style)"
            aria-label="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onLayoutModeChange('list')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              layoutMode === 'list'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
            title="List view (Notion style)"
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onLayoutModeChange('board')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              layoutMode === 'board'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
            title="Kanban Board view (by Tag)"
            aria-label="Board view"
          >
            <Kanban className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
