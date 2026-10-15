'use client';

import React from 'react';
import { 
  FileText, 
  Pin, 
  Star, 
  CheckSquare, 
  Archive, 
  Trash2, 
  Tag as TagIcon, 
  Moon, 
  Sun, 
  Plus, 
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  FolderOpen,
  User as UserIcon,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { ViewFilter, Tag } from '@/types/note';
import { UserProfile } from '@/lib/api';

interface SidebarProps {
  currentView: ViewFilter;
  onSelectView: (view: ViewFilter) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  tags: Tag[];
  notesCount: {
    all: number;
    pinned: number;
    favorites: number;
    checklists: number;
    archive: number;
    trash: number;
  };
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onNewNote: () => void;
  onResetDemo: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  selectedTag,
  onSelectTag,
  tags,
  notesCount,
  isDarkMode,
  onToggleDarkMode,
  onNewNote,
  onResetDemo,
  isOpenMobile,
  onCloseMobile,
  user,
  onOpenAuth,
  onLogout,
}) => {
  const navItems: { id: ViewFilter; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'all', label: 'All Notes', icon: <FileText className="w-4 h-4" />, count: notesCount.all },
    { id: 'pinned', label: 'Pinned', icon: <Pin className="w-4 h-4" />, count: notesCount.pinned },
    { id: 'favorites', label: 'Favorites', icon: <Star className="w-4 h-4" />, count: notesCount.favorites },
    { id: 'checklists', label: 'To-Do Lists', icon: <CheckSquare className="w-4 h-4" />, count: notesCount.checklists },
    { id: 'archive', label: 'Archive', icon: <Archive className="w-4 h-4" />, count: notesCount.archive },
    { id: 'trash', label: 'Trash', icon: <Trash2 className="w-4 h-4" />, count: notesCount.trash },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden animate-fade-in"
        />
      )}

      {/* Main Sidebar Drawer / Column */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-20 h-screen w-72 shrink-0 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-r border-zinc-200/80 dark:border-zinc-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* App Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Sparkles className="w-4 h-4 fill-white/20" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
                NoteKeep
                <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  SQLite
                </span>
              </span>
            </div>
          </div>

          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* User Account Bar */}
        <div className="p-3 mx-3 my-2 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/70 border border-zinc-200/60 dark:border-zinc-800/60">
          {user ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                  {(user.name || user.email)[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                    {user.name || 'User'}
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-white dark:hover:bg-zinc-800 transition"
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-amber-500 shrink-0" />
                <span className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">Guest / Demo Mode</span>
              </div>
              <button
                onClick={onOpenAuth}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Quick New Note Button */}
        <div className="px-4 py-2">
          <button
            onClick={() => {
              onNewNote();
              onCloseMobile();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Note</span>
          </button>
        </div>

        {/* Scrollable Navigation Views */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 custom-scrollbar">
          {/* Main Navigation Folders */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id && !selectedTag;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    onSelectTag(null);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold shadow-sm border border-amber-500/20'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.count > 0 && (
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tags Section */}
          <div className="space-y-2">
            <div className="px-3 flex items-center justify-between text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              <span>Tags</span>
              <span className="text-[10px] font-mono">{tags.length}</span>
            </div>

            <div className="space-y-0.5">
              {tags.map((tag) => {
                const isTagActive = selectedTag?.toLowerCase() === tag.name.toLowerCase();
                return (
                  <button
                    key={tag.id}
                    onClick={() => {
                      onSelectTag(isTagActive ? null : tag.name);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all ${
                      isTagActive
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold border border-amber-500/20'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="truncate">#{tag.name}</span>
                    </span>
                    {isTagActive && (
                      <span className="text-[10px] font-mono text-amber-700 dark:text-amber-300">
                        active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
          <button
            onClick={onResetDemo}
            className="w-full py-1.5 px-2.5 rounded-lg text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 flex items-center justify-center gap-1.5 transition-colors"
            title="Restore starter notes & tags"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sample Notes</span>
          </button>

          <div className="px-2 pt-1 text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
            <span>SQLite Backend</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected (Port 5000)
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
