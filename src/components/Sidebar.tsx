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
  FolderOpen
} from 'lucide-react';
import { ViewFilter, Tag } from '@/types/note';

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
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-[#f8fafc] dark:bg-[#0c0d0e] border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out select-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Workspace Branding */}
          <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-sm font-bold text-sm">
                ✦
              </div>
              <div>
                <h1 className="font-heading font-black text-sm tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  NoteKeep
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/50">
                    Pro
                  </span>
                </h1>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                  Notion & Keep Hybrid
                </p>
              </div>
            </div>

            <button
              onClick={onToggleDarkMode}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Action Button */}
          <div className="p-3">
            <button
              onClick={() => {
                onNewNote();
                if (isOpenMobile) onCloseMobile();
              }}
              className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Note</span>
            </button>
          </div>

          {/* Navigation Views */}
          <div className="flex-1 overflow-y-auto px-3 py-1 space-y-6">
            <div>
              <span className="px-2 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Workspace
              </span>
              <nav className="mt-1 space-y-0.5">
                {navItems.map((item) => {
                  const isActive = currentView === item.id && !selectedTag;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectView(item.id);
                        onSelectTag(null);
                        if (isOpenMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className={isActive ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400 dark:text-zinc-500'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </span>
                      {item.count > 0 && (
                        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 font-medium px-1.5 py-0.5 rounded-full bg-zinc-200/50 dark:bg-zinc-800/80">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tags / Labels Section */}
            <div>
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Labels & Tags
                </span>
                <TagIcon className="w-3 h-3 text-zinc-400" />
              </div>
              <div className="space-y-0.5">
                {tags.map((tag) => {
                  const isTagActive = selectedTag?.toLowerCase() === tag.name.toLowerCase();
                  return (
                    <button
                      key={tag.id}
                      onClick={() => {
                        onSelectTag(isTagActive ? null : tag.name);
                        if (isOpenMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isTagActive
                          ? 'bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-semibold border border-amber-300/60 dark:border-amber-800/50'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
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
              title="Restore original sample demo notes"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Notes</span>
            </button>

            <div className="px-2 pt-1 text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
              <span>Full-Stack Storage</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
