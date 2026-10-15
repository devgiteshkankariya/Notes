'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckSquare, 
  Palette, 
  Pin, 
  Tag as TagIcon, 
  Plus, 
  X, 
  Image as ImageIcon, 
  Smile, 
  Sparkles,
  Star
} from 'lucide-react';
import { NoteThemeId, Tag, ChecklistItem } from '@/types/note';
import { NOTE_THEMES, PRESET_COVERS, PRESET_ICONS } from '@/data/themes';

interface QuickNoteCreatorProps {
  onAddNote: (noteData: {
    title: string;
    content: string;
    theme: NoteThemeId;
    icon?: string;
    coverImage?: string;
    tags: string[];
    checklist: ChecklistItem[];
    isPinned: boolean;
    isFavorite: boolean;
  }) => Promise<void>;
  availableTags: Tag[];
  onAddNewTag: (name: string) => Promise<Tag | null>;
}

export const QuickNoteCreator: React.FC<QuickNoteCreatorProps> = ({
  onAddNote,
  availableTags,
  onAddNewTag,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [theme, setTheme] = useState<NoteThemeId>('default');
  const [icon, setIcon] = useState<string>('📝');
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Popover menus
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Collapse when clicking outside if both title and content are empty
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (!title.trim() && !content.trim() && checklist.length === 0) {
          setIsExpanded(false);
          setShowColorPicker(false);
          setShowTagPicker(false);
          setShowIconPicker(false);
          setShowCoverPicker(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [title, content, checklist]);

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

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
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

  const handleSave = async () => {
    if (!title.trim() && !content.trim() && checklist.length === 0) {
      setIsExpanded(false);
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddNote({
        title: title.trim(),
        content: content.trim(),
        theme,
        icon: icon !== '📝' || title ? icon : undefined,
        coverImage,
        tags,
        checklist,
        isPinned,
        isFavorite,
      });

      // Reset form
      setTitle('');
      setContent('');
      setTheme('default');
      setIcon('📝');
      setCoverImage(undefined);
      setTags([]);
      setChecklist([]);
      setIsPinned(false);
      setIsFavorite(false);
      setIsExpanded(false);
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedThemeObj = NOTE_THEMES[theme] || NOTE_THEMES.default;

  return (
    <div className="w-full max-w-2xl mx-auto my-6 px-4" ref={containerRef}>
      <div
        className={`w-full rounded-2xl border transition-all duration-200 overflow-hidden shadow-card-hover ${
          selectedThemeObj.cardLight
        } ${selectedThemeObj.cardDark} ${
          isExpanded ? 'ring-2 ring-amber-500/30' : 'hover:border-zinc-400 dark:hover:border-zinc-700'
        }`}
      >
        {/* Cover Image Banner (Notion Style) */}
        {isExpanded && coverImage && (
          <div className="relative h-24 w-full" style={{ background: coverImage }}>
            <button
              onClick={() => setCoverImage(undefined)}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/40 hover:bg-black/60 text-white text-xs backdrop-blur-sm transition-all"
              title="Remove banner cover"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Collapsed State: Google Keep Quick Bar */}
        {!isExpanded ? (
          <div
            onClick={() => setIsExpanded(true)}
            className="flex items-center justify-between p-3.5 cursor-text text-zinc-500 dark:text-zinc-400"
          >
            <span className="text-sm font-medium">Take a note or brainstorm an idea... ✍️</span>
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => {
                  setIsExpanded(true);
                  if (checklist.length === 0) {
                    setChecklist([{ id: `chk-${Date.now()}`, text: '', completed: false }]);
                  }
                }}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300 transition-colors"
                title="New list"
              >
                <CheckSquare className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsExpanded(true);
                  setShowColorPicker(true);
                }}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300 transition-colors"
                title="Choose theme"
              >
                <Palette className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Expanded State: Full Rich Note Composer */
          <div className="p-4 space-y-3 animate-fade-in">
            {/* Top Toolbar: Icon, Cover, Pin, Favorite */}
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2">
                {/* Emoji Icon Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center text-lg hover:scale-105 transition-all"
                    title="Change icon"
                  >
                    {icon}
                  </button>

                  {/* Icon Picker Popover */}
                  {showIconPicker && (
                    <div className="absolute top-10 left-0 z-50 p-2.5 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 grid grid-cols-5 gap-1.5 w-48">
                      {PRESET_ICONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setIcon(emoji);
                            setShowIconPicker(false);
                          }}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-base"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Cover Banner Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowCoverPicker(!showCoverPicker)}
                    className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{coverImage ? 'Change Cover' : 'Add Cover'}</span>
                  </button>

                  {/* Cover Picker Popover */}
                  {showCoverPicker && (
                    <div className="absolute top-8 left-0 z-50 p-2 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 w-52 space-y-1.5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block px-1">
                        Preset Gradients
                      </span>
                      {PRESET_COVERS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setCoverImage(preset.value);
                            setShowCoverPicker(false);
                          }}
                          className="w-full h-7 rounded-lg text-left px-2 flex items-center text-[11px] font-medium text-white shadow-sm hover:scale-[1.02] transition-transform"
                          style={{ background: preset.value }}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Pin & Favorite Toggles */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isFavorite
                      ? 'text-amber-500 bg-amber-100 dark:bg-amber-950/60'
                      : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                  }`}
                  title={isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
                >
                  <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
                </button>
                <button
                  onClick={() => setIsPinned(!isPinned)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isPinned
                      ? 'text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-950/60'
                      : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                  }`}
                  title={isPinned ? 'Unpin note' : 'Pin note to top'}
                >
                  <Pin className={`w-4 h-4 ${isPinned ? 'fill-teal-600 dark:fill-teal-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Note Title Input */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full bg-transparent font-heading font-black text-lg placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none tracking-tight"
            />

            {/* Note Content Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Take a note... (supports # markdown, - lists, `code`, and > quotes)"
              rows={3}
              className="w-full bg-transparent text-xs leading-relaxed placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none resize-none"
            />

            {/* Checklist Section */}
            {checklist.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-black/5 dark:border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Checklist Items
                </span>
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="w-3.5 h-3.5 rounded border-zinc-300 text-amber-600 focus:ring-0 cursor-pointer"
                    />
                    <span
                      className={`text-xs flex-1 ${
                        item.completed ? 'line-through opacity-50' : ''
                      }`}
                    >
                      {item.text || 'Untitled task'}
                    </span>
                    <button
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-400 hover:text-rose-500 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Checklist Item Input */}
            <div className="flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={handleAddChecklistItem}
                placeholder="Add checklist item (press Enter)..."
                className="w-full bg-transparent text-xs placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
              />
            </div>

            {/* Tag Badges Preview */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10"
                  >
                    #{t}
                    <button
                      onClick={() => toggleTag(t)}
                      className="hover:text-rose-500 text-zinc-400"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
              <div className="flex items-center gap-1 relative">
                {/* Theme Palette Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300 transition-colors"
                    title="Change theme color"
                  >
                    <Palette className="w-4 h-4" />
                  </button>

                  {/* 14 Theme Palette Dropdown */}
                  {showColorPicker && (
                    <div className="absolute bottom-8 left-0 z-50 p-2.5 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 grid grid-cols-7 gap-1.5 w-60">
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

                {/* Tag Selector Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowTagPicker(!showTagPicker)}
                    className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300 transition-colors"
                    title="Add labels"
                  >
                    <TagIcon className="w-4 h-4" />
                  </button>

                  {/* Tag Selector Popover */}
                  {showTagPicker && (
                    <div className="absolute bottom-8 left-0 z-50 p-2.5 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 w-48 space-y-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Select Tags
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
                          className="w-full text-[11px] p-1 bg-zinc-100 dark:bg-zinc-800 rounded focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateTag();
                          }}
                        />
                        <button
                          onClick={handleCreateTag}
                          className="p-1 rounded bg-amber-500 text-white text-[10px] font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Close / Save */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
