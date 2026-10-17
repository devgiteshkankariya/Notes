import { Note } from '@/types/note';

/**
 * Strips markdown symbols to produce clean, natural speech audio.
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/```[\s\S]*?```/g, ' Code snippet omitted. ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/>\s+/g, '')
    .trim();
}

/**
 * Reads aloud the given note using browser's native SpeechSynthesis API.
 */
export function speakNote(
  note: Note,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  // Cancel any ongoing speech first
  window.speechSynthesis.cancel();

  const titlePart = note.title ? `${note.title}. ` : '';
  const contentPart = cleanTextForSpeech(note.content || '');
  const checklistPart =
    note.checklist && note.checklist.length > 0
      ? ' Checklist items: ' +
        note.checklist
          .map((item) => `${item.completed ? 'Completed' : 'Pending'}: ${item.text}`)
          .join('. ')
      : '';

  const speechText = `${titlePart}${contentPart}${checklistPart}`.trim();
  if (!speechText) return false;

  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  if (onError) utterance.onerror = onError;

  window.speechSynthesis.speak(utterance);
  return true;
}

/**
 * Stops any ongoing SpeechSynthesis audio.
 */
export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Checks if browser speech synthesis is currently active.
 */
export function isSpeechActive(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  return window.speechSynthesis.speaking;
}

/**
 * Downloads a note directly to user's computer as a formatted .md (Markdown) file.
 */
export function downloadNoteAsMarkdown(note: Note): void {
  if (typeof window === 'undefined') return;

  let md = `# ${note.title || 'Untitled Note'}\n\n`;

  if (note.tags && note.tags.length > 0) {
    md += `**Tags**: ${note.tags.map((t) => `#${t}`).join(' ')}\n\n`;
  }

  md += `*Last updated: ${new Date(note.updatedAt).toLocaleString()}*\n\n---\n\n`;

  if (note.content) {
    md += `${note.content}\n\n`;
  }

  if (note.checklist && note.checklist.length > 0) {
    md += `### Checklist\n`;
    note.checklist.forEach((item) => {
      md += `- [${item.completed ? 'x' : ' '}] ${item.text}\n`;
    });
    md += `\n`;
  }

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeTitle = (note.title || 'note')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase()
    .slice(0, 40);

  link.href = url;
  link.download = `${safeTitle || 'note'}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Calculates word count, character count, and estimated reading time.
 */
export function getNoteStats(content: string, checklist: { text: string }[] = []) {
  const checklistWords = checklist.map((c) => c.text).join(' ');
  const combined = `${content || ''} ${checklistWords}`.trim();

  const words = combined ? combined.split(/\s+/).filter(Boolean).length : 0;
  const chars = combined.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return {
    words,
    chars,
    readingTimeMinutes,
  };
}
