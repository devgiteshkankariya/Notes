import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'NoteKeep Studio | Notion & Google Keep Hybrid',
  description:
    'A modern, full-stack note-taking platform combining Google Keep’s vibrant themes and quick capture with Notion’s block structure and workspace power.',
  keywords: [
    'Notes App',
    'Google Keep Alternative',
    'Notion Style Notes',
    'Markdown Notes',
    'Full-Stack Notes',
    'Color Themes',
    'Kanban Notes',
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f8fafc',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50 antialiased transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
