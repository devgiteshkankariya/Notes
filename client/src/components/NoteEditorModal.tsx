'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Pin, 
  Star, 
  Archive, 
  Trash2, 
  Palette, 
  Tag as TagIcon, 
  Image as ImageIcon, 
  Smile, 
  Plus, 
  Eye, 
  Edit3, 
  Check, 
  Copy,
  Volume2,
  VolumeX,
  Download
} from 'lucide-react';
import { Note, NoteThemeId, Tag, ChecklistItem } from '@/types/note';
import { NOTE_THEMES, PRESET_COVERS, PRESET_ICONS } from '@/data/themes';
import { renderMarkdown } from '@/utils/markdown';
import { speakNote, stopSpeaking, downloadNoteAsMarkdown, getNoteStats } from '@/utils/noteHelpers';

interface NoteEditorModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedNote: Partial<Note> & { id: string }) => Promise<void>;
  onDelete: (id: string, isPermanent: boolean) => void;
  availableTags: Tag[];
  onAddNewTag: (name: string) => Promise<Tag | null>;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  note,
  isOpen,
  onClose,
  onSave,
  onDelete,
  availableTags,
  onAddNewTag,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [theme, setTheme] = useState<NoteThemeId>('default');
  const [icon, setIcon] = useState<string | undefined>(undefined);
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [previewMode, setPreviewMode] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTheme(note.theme || 'default');
      setIcon(note.icon);
      setCoverImage(note.coverImage);
      setTags(note.tags || []);
      setChecklist(note.checklist || []);
      setIsPinned(note.isPinned || false);
      setIsFavorite(note.isFavorite || false);
      setPreviewMode(false);
      setIsSpeaking(false);
      stopSpeaking();
    }
  }, [note]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const stats = getNoteStats(content, checklist);

  const handleToggleModalSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else if (note) {
      const activeNote: Note = {
        ...note,
        title,
        content,
        theme,
        icon,
        coverImage,
        tags,
        checklist,
        isPinned,
        isFavorite,
      };
      setIsSpeaking(true);
      const started = speakNote(
        activeNote,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
      if (!started) setIsSpeaking(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!note) return;
    const activeNote: Note = {
      ...note,
      title,
      content,
      theme,
      icon,
      coverImage,
      tags,
      checklist,
      isPinned,
      isFavorite,
    };
    downloadNoteAsMarkdown(activeNote);
  };

  if (!isOpen || !note) return null;

  const handleSaveAndClose = async () => {
    stopSpeaking();
    setIsSpeaking(false);
    try {
      setIsSaving(true);
      await onSave({
        id: note.id,
        title: title.trim(),
        content: content.trim(),
        theme,
        icon,
        coverImage,
        tags,
        checklist,
        isPinned,
        isFavorite,
      });
      onClose();
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddChecklistItem = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newChecklistText.trim()) {
      e.preventDefault();
      setChecklist([
        ...checklist,
        {
          id: `chk-${Date.now()}`,
          text: newChecklistText.trim(),
          completed: false,
        },
      ]);
      setNewChecklistText('');
    }
  };

  const toggleChecklist = (id: string) => {
    setChecklist(
      checklist.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
  };

  const removeChecklist = (id: string) => {
    setChecklist(checklist.filter((c) => c.id !== id));
  };

  const toggleTag = (tagName: string) => {
    if (tags.includes(tagName)) {
      setTags(tags.filter((t) => t !== tagName));
    } else {
      setTags([...tags, tagName]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagInput.trim()) return;
    const created = await onAddNewTag(newTagInput.trim());
    if (created) {
      if (!tags.includes(created.name)) {
        setTags([...tags, created.name]);
      }
      setNewTagInput('');
    }
  };

  const themeObj = NOTE_THEMES[theme] || NOTE_THEMES.default;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-3xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-scale-up ${
          themeObj.cardLight
        } ${themeObj.cardDark}`}
      >
        {/* Cover Header Banner (Notion Style) */}
        {coverImage && (
          <div className="relative h-32 w-full shrink-0" style={{ background: coverImage }}>
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <button
                onClick={() => setShowCoverPicker(!showCoverPicker)}
                className="px-2.5 py-1 rounded-lg bg-black/50 hover:bg-black/70 text-white text-xs font-medium backdrop-blur-sm transition-all"
              >
                Change Cover
              </button>
              <button
                onClick={() => setCoverImage(undefined)}
                className="p-1 rounded-lg bg-black/50 hover:bg-black/70 text-white text-xs backdrop-blur-sm transition-all"
                title="Remove cover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Top Control Bar */}
        <div className="p-4 flex items-center justify-between border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            {/* Add Cover if not present */}
            {!coverImage && (
              <div className="relative">
                <button
                  onClick={() => setShowCoverPicker(!showCoverPicker)}
                  className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Add Cover</span>
                </button>
                {showCoverPicker && (
                  <div className="absolute top-10 left-0 z-50 p-2.5 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-52 space-y-1.5">
                    {PRESET_COVERS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setCoverImage(preset.value);
                          setShowCoverPicker(false);
                        }}
                        className="w-full h-8 rounded-lg text-left px-2.5 flex items-center text-xs font-medium text-white shadow-sm hover:scale-[1.02] transition-transform"
                        style={{ background: preset.value }}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Toggle Preview / Edit Mode */}
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                previewMode
                  ? 'bg-amber-500 text-white'
                  : 'bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-200 hover:bg-black/10'
              }`}
            >
              {previewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{previewMode ? 'Edit Mode' : 'Markdown Preview'}</span>
            </button>

            {/* Read Aloud (Text to Speech) */}
            <button
              type="button"
              onClick={handleToggleModalSpeech}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                isSpeaking
                  ? 'bg-teal-600 text-white'
                  : 'bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-200 hover:bg-black/10'
              }`}
              title={isSpeaking ? 'Stop voice reading' : 'Read note aloud (Text-to-Speech)'}
            >
              {isSpeaking ? (
                <VolumeX className="w-3.5 h-3.5 animate-pulse" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{isSpeaking ? 'Stop Audio' : 'Read Aloud'}</span>
            </button>

            {/* Export as Markdown File */}
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-200 hover:bg-black/10 transition-colors"
              title="Download note as Markdown file (.md)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export .md</span>
            </button>
          </div>

          {/* Right Header Controls: Pin, Favorite, Close */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-xl transition-colors ${
                isFavorite
                  ? 'text-amber-500 bg-amber-100 dark:bg-amber-950/60'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
              }`}
              title={isFavorite ? 'Favorited' : 'Favorite'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
            </button>
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-xl transition-colors ${
                isPinned
                  ? 'text-teal-600 bg-teal-100 dark:bg-teal-950/60'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
              }`}
              title={isPinned ? 'Unpin note' : 'Pin note to top'}
            >
              <Pin className={`w-4 h-4 ${isPinned ? 'fill-teal-600' : ''}`} />
            </button>
            <button
              onClick={handleSaveAndClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10"
              title="Close and save"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Icon Picker & Title */}
          <div className="flex items-start gap-3">
            <div className="relative">
              <button
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-2xl hover:scale-105 transition-transform"
                title="Change Icon"
              >
                {icon || '📝'}
              </button>

              {showIconPicker && (
                <div className="absolute top-12 left-0 z-50 p-2.5 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 grid grid-cols-5 gap-1.5 w-52">
                  {PRESET_ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setIcon(emoji);
                        setShowIconPicker(false);
                      }}
                      className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Document"
              className="w-full bg-transparent font-heading font-black text-2xl sm:text-3xl placeholder-zinc-300 dark:placeholder-zinc-600 focus:outline-none tracking-tight leading-tight"
            />
          </div>

          {/* Tags bar */}
          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-black/10 dark:bg-white/10"
              >
                #{t}
                <button onClick={() => toggleTag(t)} className="hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <div className="relative">
              <button
                onClick={() => setShowTagPicker(!showTagPicker)}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border border-black/10 dark:border-white/15 hover:bg-black/5"
              >
                <Plus className="w-3 h-3" /> Tag
              </button>
              {showTagPicker && (
                <div className="absolute top-8 left-0 z-50 p-2.5 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 w-48 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Available Tags
                  </span>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {availableTags.map((t) => (
                      <label
                        key={t.id}
                        className="flex items-center gap-2 text-xs cursor-pointer p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <input
                          type="checkbox"
                          checked={tags.includes(t.name)}
                          onChange={() => toggleTag(t.name)}
                          className="rounded text-amber-600"
                        />
                        <span>{t.name}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      placeholder="New tag..."
                      className="w-full text-xs p-1 bg-zinc-100 dark:bg-zinc-800 rounded focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateTag();
                      }}
                    />
                    <button
                      onClick={handleCreateTag}
                      className="p-1 rounded bg-amber-500 text-white text-xs font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content: Edit Area or Live Markdown Preview */}
          {previewMode ? (
            <div className="min-h-[220px] p-4 rounded-2xl bg-black/5 dark:bg-white/5 note-markdown">
              {content ? (
                renderMarkdown(content)
              ) : (
                <p className="text-sm opacity-50 italic">No content written yet.</p>
              )}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your notes in Markdown (# Headings, - lists, `code`, > quotes, etc.)..."
              rows={10}
              className="w-full bg-transparent text-sm leading-relaxed placeholder-zinc-300 dark:placeholder-zinc-600 focus:outline-none resize-none"
            />
          )}

          {/* Checklist Tasks Section */}
          <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Actionable Tasks ({checklist.filter((c) => c.completed).length}/{checklist.length})
              </span>
            </div>

            <div className="space-y-1.5">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2 group">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklist(item.id)}
                    className="w-4 h-4 rounded border-zinc-400 text-amber-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                      const newText = e.target.value;
                      setChecklist(
                        checklist.map((c) => (c.id === item.id ? { ...c, text: newText } : c))
                      );
                    }}
                    className={`flex-1 bg-transparent text-xs focus:outline-none ${
                      item.completed ? 'line-through opacity-50' : ''
                    }`}
                  />
                  <button
                    onClick={() => removeChecklist(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-500 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Plus className="w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={handleAddChecklistItem}
                placeholder="Add task and press Enter..."
                className="w-full bg-transparent text-xs placeholder-zinc-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Metadata & Theme Palettes */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] opacity-60 font-mono">
              {stats.words} words · {stats.chars} chars · ~{stats.readingTimeMinutes}m read · Edited{' '}
              {new Date(note.updatedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>

            {/* Theme Color Selector */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10"
              >
                <Palette className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Theme</span>
              </button>

              {showColorPicker && (
                <div className="absolute bottom-9 left-0 z-50 p-2.5 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 grid grid-cols-7 gap-1.5 w-60">
                  {Object.values(NOTE_THEMES).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setShowColorPicker(false);
                      }}
                      className={`w-6 h-6 rounded-full border border-black/10 dark:border-white/20 transition-transform hover:scale-110 flex items-center justify-center ${
                        theme === t.id ? 'ring-2 ring-amber-500' : ''
                      }`}
                      style={{ background: t.previewColor }}
                      title={t.name}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onDelete(note.id, false);
                onClose();
              }}
              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleSaveAndClose}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
