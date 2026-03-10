import React, { useState, useRef, useEffect } from 'react';

interface ConnectedUser {
  userId: string;
  username: string;
}

const COLORS = ['#f87171', '#fb923c', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#38bdf8'];

function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface EditorToolbarProps {
  title: string;
  onTitleChange: (title: string) => void;
  onBack: () => void;
  onInsertMarkdown: (before: string, after?: string) => void;
  onImageUpload: (file: File) => void;
  showPreview: boolean;
  onTogglePreview: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onExport: () => void;
  onExportPdf: () => void;
  access: string;
  onShare: () => void;
  connectedUsers: ConnectedUser[];
  currentUserId?: string;
  saving: boolean;
  saved: boolean;
  vimMode: boolean;
  onToggleVim: () => void;
  onUndo: () => void;
  onRedo: () => void;
  lastEdited?: string;
  onImportMarkdown?: (content: string) => void;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  title,
  onTitleChange,
  onBack,
  onInsertMarkdown,
  onImageUpload,
  showPreview,
  onTogglePreview,
  isFullscreen,
  onToggleFullscreen,
  onExport,
  onExportPdf,
  access,
  onShare,
  connectedUsers,
  currentUserId,
  saving,
  saved,
  vimMode,
  onToggleVim,
  onUndo,
  onRedo,
  lastEdited,
  onImportMarkdown,
}) => {
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close export dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    if (exportOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [exportOpen]);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportMarkdown) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === 'string') {
        onImportMarkdown(text);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="glass-card p-2 mb-2 flex items-center gap-1.5 flex-wrap" style={{ borderRadius: '0.75rem' }}>
      {/* Navigation */}
      {!isFullscreen && (
        <button onClick={onBack} className="btn-secondary text-sm py-1 px-2.5" title="Back to documents">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="input-field flex-1 min-w-32 text-sm py-1"
        placeholder="Document title..."
        style={{ maxWidth: isFullscreen ? '400px' : '250px' }}
        readOnly={access === 'read'}
      />

      {/* Divider */}
      <div className="h-5 w-px mx-0.5" style={{ background: 'var(--color-border)' }} />

      {/* Undo/Redo */}
      <button onClick={onUndo} className="btn-secondary text-sm py-1 px-1.5" title="Undo (Ctrl+Z)">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </button>
      <button onClick={onRedo} className="btn-secondary text-sm py-1 px-1.5" title="Redo (Ctrl+Shift+Z)">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
        </svg>
      </button>

      {/* Divider */}
      <div className="h-5 w-px mx-0.5" style={{ background: 'var(--color-border)' }} />

      {/* Formatting */}
      <button onClick={() => onInsertMarkdown('**', '**')} className="btn-secondary text-sm py-1 px-1.5 font-bold" title="Bold (Ctrl+B)">B</button>
      <button onClick={() => onInsertMarkdown('*', '*')} className="btn-secondary text-sm py-1 px-1.5 italic" title="Italic (Ctrl+I)">I</button>
      <button onClick={() => onInsertMarkdown('~~', '~~')} className="btn-secondary text-sm py-1 px-1.5 line-through" title="Strikethrough">S</button>
      <button onClick={() => onInsertMarkdown('# ')} className="btn-secondary text-sm py-1 px-1.5" title="Heading 1">H1</button>
      <button onClick={() => onInsertMarkdown('## ')} className="btn-secondary text-sm py-1 px-1.5" title="Heading 2">H2</button>
      <button onClick={() => onInsertMarkdown('### ')} className="btn-secondary text-sm py-1 px-1.5" title="Heading 3">H3</button>
      <button onClick={() => onInsertMarkdown('`', '`')} className="btn-secondary text-sm py-1 px-1.5 font-mono" title="Inline Code">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </button>
      <button onClick={() => onInsertMarkdown('```\n', '\n```')} className="btn-secondary text-sm py-1 px-1.5" title="Code Block">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      <button onClick={() => onInsertMarkdown('- ')} className="btn-secondary text-sm py-1 px-1.5" title="Unordered List">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <button onClick={() => onInsertMarkdown('1. ')} className="btn-secondary text-sm py-1 px-1.5" title="Ordered List">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <text x="2" y="8" fontSize="8" fontFamily="monospace">1.</text>
          <line x1="10" y1="6" x2="22" y2="6" stroke="currentColor" strokeWidth="2" />
          <line x1="10" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
          <line x1="10" y1="18" x2="22" y2="18" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
      <button onClick={() => onInsertMarkdown('[', '](url)')} className="btn-secondary text-sm py-1 px-1.5" title="Link">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </button>
      <button onClick={() => onInsertMarkdown('> ')} className="btn-secondary text-sm py-1 px-1.5" title="Blockquote">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
      <button onClick={() => onInsertMarkdown('- [ ] ')} className="btn-secondary text-sm py-1 px-1.5" title="Task List">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </button>

      {/* Image upload */}
      <label className="btn-secondary text-sm py-1 px-1.5 cursor-pointer" title="Upload Image">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) onImageUpload(e.target.files[0]); }}
        />
      </label>

      {/* Divider */}
      <div className="h-5 w-px mx-0.5" style={{ background: 'var(--color-border)' }} />

      {/* View toggles */}
      <button onClick={onTogglePreview} className="btn-secondary text-sm py-1 px-2" title={showPreview ? 'Editor Only' : 'Split View'}>
        {showPreview ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
          </svg>
        )}
      </button>

      <button onClick={onToggleFullscreen} className="btn-secondary text-sm py-1 px-2" title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen'}>
        {isFullscreen ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        )}
      </button>

      <button
        onClick={onToggleVim}
        className={`btn-secondary text-sm py-1 px-2 font-mono ${vimMode ? 'ring-1' : ''}`}
        style={vimMode ? { borderColor: 'var(--color-accent)', color: 'var(--color-accent)' } : {}}
        title={vimMode ? 'Disable Vim Mode' : 'Enable Vim Mode'}
      >
        vim
      </button>

      {/* Divider */}
      <div className="h-5 w-px mx-0.5" style={{ background: 'var(--color-border)' }} />

      {/* Import Markdown */}
      <label className="btn-secondary text-sm py-1 px-2 cursor-pointer" title="Import Markdown (.md)">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <input
          type="file"
          accept=".md,.markdown,.txt"
          className="hidden"
          onChange={handleImportFile}
        />
      </label>

      {/* Export dropdown (click-based) */}
      <div className="relative" ref={exportRef}>
        <button
          onClick={() => setExportOpen(!exportOpen)}
          className="btn-secondary text-sm py-1 px-2"
          title="Export"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
        {exportOpen && (
          <div className="absolute right-0 top-full mt-1 z-50">
            <div className="glass-card p-1 min-w-32 shadow-xl" style={{ border: '1px solid var(--color-border)' }}>
              <button
                onClick={() => { onExport(); setExportOpen(false); }}
                className="w-full text-left text-sm py-1.5 px-3 rounded hover:bg-white/5 transition-colors"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Export HTML
              </button>
              <button
                onClick={() => { onExportPdf(); setExportOpen(false); }}
                className="w-full text-left text-sm py-1.5 px-3 rounded hover:bg-white/5 transition-colors"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Export PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {access === 'owner' && (
        <button onClick={onShare} className="btn-primary text-sm py-1 px-2.5">
          Share
        </button>
      )}

      {/* Right side: users + status */}
      <div className="flex items-center gap-1 ml-auto">
        {connectedUsers.filter(u => u.userId !== currentUserId).map((u) => (
          <div
            key={u.userId}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: getUserColor(u.userId) }}
            title={u.username}
          >
            {u.username[0]?.toUpperCase()}
          </div>
        ))}

        <div className="flex flex-col items-end ml-2">
          <span className="text-[10px] leading-tight" style={{ color: 'var(--color-text-secondary)' }}>
            {saving ? 'Saving...' : saved ? 'Saved' : access === 'read' ? 'Read-only' : ''}
          </span>
          {lastEdited && (
            <span className="text-[10px] leading-tight" style={{ color: 'var(--color-text-tertiary, var(--color-text-secondary))' }}>
              {formatRelativeTime(lastEdited)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
