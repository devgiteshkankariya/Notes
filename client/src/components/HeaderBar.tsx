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
  Sparkles,
  User as UserIcon,
  LogOut
} from 'lucide-react';
import { LayoutMode, ViewFilter } from '@/types/note';
import { UserProfile } from '@/lib/api';

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
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
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
  user,
  onOpenAuth,
  onLogout,
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
        {/* Left Section: Mobile Menu Trigger & View Title */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 -ml-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-baseline gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white capitalize">
              {getTitle()}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              {notesCount}
            </span>
          </div>
        </div>

        {/* Center Section: Search Bar */}
        <div className="flex-1 max-w-xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-amber-500 transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search notes, tags, or tasks..."
              className="w-full pl-10 pr-24 py-2 bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-amber-500/50 rounded-2xl text-sm placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100 outline-none transition-all duration-200 shadow-sm"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenCommandPalette}
                className="hidden sm:flex absolute inset-y-0 right-2 items-center my-auto h-6 px-1.5 rounded-md bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
                title="Open Command Palette (Ctrl+K)"
              >
                <span className="flex items-center gap-0.5">
                  <Command className="w-3 h-3" />K
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Layout Mode Switcher & User Account */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-200/60 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
            <button
              onClick={() => onLayoutModeChange('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                layoutMode === 'grid'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
              title="Grid view"
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
              title="List view"
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
              title="Kanban Board view"
              aria-label="Board view"
            >
              <Kanban className="w-4 h-4" />
            </button>
          </div>

          {/* User Auth Profile Trigger */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-zinc-200 dark:border-zinc-800">
              <div 
                className="w-8 h-8 rounded-full bg-amber-500/10 dark:bg-amber-400/20 text-amber-600 dark:text-amber-400 font-semibold flex items-center justify-center text-xs border border-amber-500/20"
                title={`Signed in as ${user.email}`}
              >
                {(user.name || user.email)[0].toUpperCase()}
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <UserIcon size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
