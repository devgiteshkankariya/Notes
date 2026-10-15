'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Pin, 
  Sparkles, 
  Trash2, 
  RotateCcw, 
  Inbox, 
  FolderPlus,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Note, NoteThemeId, Tag, ViewFilter, LayoutMode } from '@/types/note';
import { Sidebar } from '@/components/Sidebar';
import { HeaderBar } from '@/components/HeaderBar';
import { QuickNoteCreator } from '@/components/QuickNoteCreator';
import { NoteCard } from '@/components/NoteCard';
import { NoteEditorModal } from '@/components/NoteEditorModal';
import { KanbanBoard } from '@/components/KanbanBoard';
import { CommandPalette } from '@/components/CommandPalette';
import { AuthModal } from '@/components/AuthModal';
import { apiFetch, getStoredUser, clearStoredAuth, UserProfile } from '@/lib/api';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // User Authentication State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // View state
  const [currentView, setCurrentView] = useState<ViewFilter>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');

  // Theme & Modals
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeEditingNote, setActiveEditingNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize Dark Mode & Auth from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('notekeep_dark_mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'true' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    const savedUser = getStoredUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('notekeep_dark_mode', String(next));
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Fetch Notes & Tags from Express Backend API
  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (currentView) params.set('view', currentView);
      if (selectedTag) params.set('tag', selectedTag);
      if (searchQuery) params.set('search', searchQuery);

      const res = await apiFetch(`/api/notes?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.notes)) {
        setNotes(data.notes);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      showToast('Could not sync with backend server.');
    } finally {
      setIsLoading(false);
    }
  }, [currentView, selectedTag, searchQuery]);

  const fetchTags = async () => {
    try {
      const res = await apiFetch('/api/tags');
      const data = await res.json();
      if (data.success && Array.isArray(data.tags)) {
        setTags(data.tags);
      }
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes, user]);

  useEffect(() => {
    fetchTags();
  }, [user]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add Note Handler
  const handleAddNote = async (noteData: {
    title: string;
    content: string;
    theme: NoteThemeId;
    icon?: string;
    coverImage?: string;
    tags: string[];
    checklist: any[];
    isPinned: boolean;
    isFavorite: boolean;
  }) => {
    try {
      const res = await apiFetch('/api/notes', {
        method: 'POST',
        body: JSON.stringify(noteData),
      });
      const data = await res.json();
      if (data.success && data.note) {
        setNotes((prev) => [data.note, ...prev]);
        showToast('Note created in SQLite!');
      }
    } catch (err) {
      console.error('Error adding note:', err);
      showToast('Failed to save note');
    }
  };

  // Update Note Handler
  const handleUpdateNote = async (updatedFields: Partial<Note> & { id: string }) => {
    try {
      const res = await apiFetch(`/api/notes/${updatedFields.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedFields),
      });
      const data = await res.json();
      if (data.success && data.note) {
        setNotes((prev) =>
          prev.map((n) => (n.id === updatedFields.id ? data.note : n))
        );
      }
    } catch (err) {
      console.error('Error updating note:', err);
      showToast('Failed to sync changes with server');
    }
  };

  // Quick Pin Toggle
  const handleTogglePin = async (id: string, current: boolean) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !current } : n))
    );
    await handleUpdateNote({ id, isPinned: !current });
    showToast(!current ? 'Note pinned to top 📌' : 'Note unpinned');
  };

  // Quick Favorite Toggle
  const handleToggleFavorite = async (id: string, current: boolean) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isFavorite: !current } : n))
    );
    await handleUpdateNote({ id, isFavorite: !current });
    showToast(!current ? 'Added to favorites ⭐' : 'Removed from favorites');
  };

  // Quick Archive Toggle
  const handleToggleArchive = async (id: string, current: boolean) => {
    await handleUpdateNote({ id, isArchived: !current });
    fetchNotes();
    showToast(!current ? 'Note moved to Archive 📦' : 'Note unarchived');
  };

  // Delete / Trash Handler
  const handleDeleteNote = async (id: string, isPermanent: boolean) => {
    try {
      await apiFetch(`/api/notes/${id}?permanent=${isPermanent}`, {
        method: 'DELETE',
      });
      setNotes((prev) => prev.filter((n) => n.id !== id));
      showToast(isPermanent ? 'Note permanently deleted' : 'Note moved to Trash 🗑️');
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  // Restore Note from Trash
  const handleRestoreFromTrash = async (id: string) => {
    await handleUpdateNote({ id, isTrashed: false });
    fetchNotes();
    showToast('Note restored from Trash ✨');
  };

  // Change Theme Color
  const handleChangeTheme = async (id: string, theme: NoteThemeId) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, theme } : n)));
    await handleUpdateNote({ id, theme });
  };

  // Toggle Checklist Item
  const handleToggleChecklist = async (noteId: string, itemId: string) => {
    const targetNote = notes.find((n) => n.id === noteId);
    if (!targetNote) return;

    const updatedChecklist = targetNote.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, checklist: updatedChecklist } : n))
    );

    await handleUpdateNote({ id: noteId, checklist: updatedChecklist });
  };

  // Duplicate Note
  const handleDuplicateNote = async (note: Note) => {
    await handleAddNote({
      title: `${note.title || 'Untitled'} (Copy)`,
      content: note.content,
      theme: note.theme,
      icon: note.icon,
      coverImage: note.coverImage,
      tags: [...note.tags],
      checklist: [...note.checklist],
      isPinned: false,
      isFavorite: false,
    });
    showToast('Note duplicated!');
  };

  // Add New Tag
  const handleAddNewTag = async (name: string): Promise<Tag | null> => {
    try {
      const res = await apiFetch('/api/tags', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success && data.tag) {
        if (!tags.some((t) => t.id === data.tag.id)) {
          setTags((prev) => [...prev, data.tag]);
        }
        return data.tag;
      }
      return null;
    } catch (err) {
      console.error('Error adding tag:', err);
      return null;
    }
  };

  // Reset Demo Notes
  const handleResetDemo = async () => {
    try {
      const res = await apiFetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchNotes();
        fetchTags();
        showToast('Starter notes & tags restored ✨');
      }
    } catch (err) {
      console.error('Error resetting notes:', err);
    }
  };

  const handleLogout = () => {
    clearStoredAuth();
    setUser(null);
    showToast('Signed out from account');
  };

  // Counts for sidebar badges
  const notesCount = {
    all: notes.filter((n) => !n.isTrashed && !n.isArchived).length,
    pinned: notes.filter((n) => !n.isTrashed && !n.isArchived && n.isPinned).length,
    favorites: notes.filter((n) => !n.isTrashed && !n.isArchived && n.isFavorite).length,
    checklists: notes.filter(
      (n) => !n.isTrashed && !n.isArchived && n.checklist && n.checklist.length > 0
    ).length,
    archive: notes.filter((n) => !n.isTrashed && n.isArchived).length,
    trash: notes.filter((n) => n.isTrashed).length,
  };

  // Separate pinned notes in active view
  const pinnedNotes = notes.filter((n) => n.isPinned && !n.isTrashed && !n.isArchived);
  const otherNotes = notes.filter((n) => !n.isPinned && !n.isTrashed && !n.isArchived);
  const shouldSplitPinned =
    currentView !== 'archive' &&
    currentView !== 'trash' &&
    layoutMode !== 'board' &&
    pinnedNotes.length > 0 &&
    otherNotes.length > 0;

  return (
    <div className="min-h-screen flex bg-[#f8fafc] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors selection:bg-amber-500/20 selection:text-amber-600">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        tags={tags}
        notesCount={notesCount}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onNewNote={() => {
          setActiveEditingNote({
            id: '',
            title: '',
            content: '',
            theme: 'default',
            icon: '📝',
            tags: selectedTag ? [selectedTag] : [],
            checklist: [],
            isPinned: false,
            isFavorite: false,
            isArchived: false,
            isTrashed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          setIsEditorOpen(true);
        }}
        onResetDemo={handleResetDemo}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          layoutMode={layoutMode}
          onLayoutModeChange={setLayoutMode}
          currentView={currentView}
          selectedTag={selectedTag}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          notesCount={notes.length}
          user={user}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold shadow-2xl animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Content Scroll Container */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {/* Quick Note Creator (Google Keep Style) - only in active note views */}
          {currentView !== 'archive' && currentView !== 'trash' && !selectedTag && (
            <QuickNoteCreator
              onAddNote={handleAddNote}
              availableTags={tags}
              onAddNewTag={handleAddNewTag}
            />
          )}

          {/* Trash Bin Header Banner */}
          {currentView === 'trash' && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 text-xs">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Notes in Trash can be restored or permanently removed from SQLite database.</span>
              </div>
            </div>
          )}

          {/* Archive Header Banner */}
          {currentView === 'archive' && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-amber-900 dark:text-amber-200 text-xs">
              <span>These notes are archived and hidden from your main board.</span>
            </div>
          )}

          {/* Main Notes View Render */}
          {layoutMode === 'board' ? (
            /* Kanban Board Mode (Notion Style) */
            <KanbanBoard
              notes={notes}
              tags={tags}
              onOpenEdit={(note) => {
                setActiveEditingNote(note);
                setIsEditorOpen(true);
              }}
              onTogglePin={handleTogglePin}
              onToggleFavorite={handleToggleFavorite}
              onToggleArchive={handleToggleArchive}
              onDelete={handleDeleteNote}
              onRestoreFromTrash={handleRestoreFromTrash}
              onChangeTheme={handleChangeTheme}
              onToggleChecklist={handleToggleChecklist}
              onDuplicate={handleDuplicateNote}
              onQuickAddWithTag={(tag) => {
                setActiveEditingNote({
                  id: '',
                  title: '',
                  content: '',
                  theme: 'default',
                  icon: '📝',
                  tags: tag ? [tag] : [],
                  checklist: [],
                  isPinned: false,
                  isFavorite: false,
                  isArchived: false,
                  isTrashed: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
                setIsEditorOpen(true);
              }}
            />
          ) : (
            /* Grid or List Mode (Google Keep / Notion Hybrid) */
            <div className="space-y-8">
              {/* Pinned Section (if split) */}
              {shouldSplitPinned && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    <Pin className="w-3.5 h-3.5 text-teal-600" />
                    <span>Pinned Notes</span>
                  </div>
                  <div
                    className={
                      layoutMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                        : 'flex flex-col gap-2.5 max-w-4xl mx-auto'
                    }
                  >
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onOpenEdit={(n) => {
                          setActiveEditingNote(n);
                          setIsEditorOpen(true);
                        }}
                        onTogglePin={handleTogglePin}
                        onToggleFavorite={handleToggleFavorite}
                        onToggleArchive={handleToggleArchive}
                        onDelete={handleDeleteNote}
                        onRestoreFromTrash={handleRestoreFromTrash}
                        onChangeTheme={handleChangeTheme}
                        onToggleChecklist={handleToggleChecklist}
                        onDuplicate={handleDuplicateNote}
                        layoutMode={layoutMode}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Others Section */}
              <div className="space-y-3">
                {shouldSplitPinned && (
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Others</span>
                  </div>
                )}

                {notes.length === 0 ? (
                  /* Empty State */
                  <div className="py-20 flex flex-col items-center justify-center text-center p-6 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center text-zinc-400 mb-4">
                      <Inbox className="w-8 h-8" />
                    </div>
                    <h3 className="font-heading font-black text-lg text-zinc-800 dark:text-zinc-200 mb-1">
                      No notes found
                    </h3>
                    <p className="text-xs text-zinc-500 max-w-sm mb-4">
                      {searchQuery
                        ? `No matches for "${searchQuery}". Try searching for something else.`
                        : selectedTag
                        ? `No notes tagged with #${selectedTag} yet.`
                        : 'Your canvas is clean! Use the top bar to capture a quick thought or task.'}
                    </p>
                    <button
                      onClick={handleResetDemo}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Demo Notes</span>
                    </button>
                  </div>
                ) : (
                  <div
                    className={
                      layoutMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                        : 'flex flex-col gap-2.5 max-w-4xl mx-auto'
                    }
                  >
                    {(shouldSplitPinned ? otherNotes : notes).map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onOpenEdit={(n) => {
                          setActiveEditingNote(n);
                          setIsEditorOpen(true);
                        }}
                        onTogglePin={handleTogglePin}
                        onToggleFavorite={handleToggleFavorite}
                        onToggleArchive={handleToggleArchive}
                        onDelete={handleDeleteNote}
                        onRestoreFromTrash={handleRestoreFromTrash}
                        onChangeTheme={handleChangeTheme}
                        onToggleChecklist={handleToggleChecklist}
                        onDuplicate={handleDuplicateNote}
                        layoutMode={layoutMode}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Notion-Style Full Note Editor Modal */}
      <NoteEditorModal
        note={activeEditingNote}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setActiveEditingNote(null);
        }}
        onSave={async (updatedData) => {
          if (!updatedData.id) {
            // New Note
            await handleAddNote(updatedData as any);
          } else {
            // Existing Note
            await handleUpdateNote(updatedData);
          }
        }}
        onDelete={handleDeleteNote}
        availableTags={tags}
        onAddNewTag={handleAddNewTag}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          showToast(`Welcome, ${loggedUser.name || loggedUser.email}!`);
        }}
      />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        notes={notes}
        onSelectNote={(note) => {
          setActiveEditingNote(note);
          setIsEditorOpen(true);
        }}
        onNewNote={() => {
          setActiveEditingNote({
            id: '',
            title: '',
            content: '',
            theme: 'default',
            icon: '📝',
            tags: [],
            checklist: [],
            isPinned: false,
            isFavorite: false,
            isArchived: false,
            isTrashed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          setIsEditorOpen(true);
        }}
        onSelectView={setCurrentView}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onResetDemo={handleResetDemo}
      />
    </div>
  );
}
