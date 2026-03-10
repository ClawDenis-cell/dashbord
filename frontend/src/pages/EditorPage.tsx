import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentStore, useAuthStore, useSettingsStore } from '../store';
import { documentsApi } from '../api/documents';
import { io, Socket } from 'socket.io-client';

interface ConnectedUser {
  userId: string;
  username: string;
  cursor?: { line: number; ch: number };
}

const COLORS = ['#f87171', '#fb923c', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#38bdf8'];

function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentDocument, fetchDocument, loading } = useDocumentStore();
  const { settings } = useSettingsStore();

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [access, setAccess] = useState<string>('owner');
  const [showShareModal, setShowShareModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (id) fetchDocument(id);
  }, [id, fetchDocument]);

  useEffect(() => {
    if (currentDocument) {
      setContent(currentDocument.content || '');
      setTitle(currentDocument.title || '');
      setAccess((currentDocument as any).access || 'owner');
    }
  }, [currentDocument]);

  // Socket.IO connection
  useEffect(() => {
    if (!id || !user) return;

    const token = localStorage.getItem('token');
    const wsUrl = import.meta.env.VITE_WS_URL || window.location.origin;

    const socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-document', { documentId: id, username: user.username });
    });

    socket.on('current-users', (data) => {
      setConnectedUsers(data.users);
      if (data.access) setAccess(data.access);
    });

    socket.on('user-joined', (data) => {
      setConnectedUsers(data.users);
    });

    socket.on('user-left', (data) => {
      setConnectedUsers(data.users);
    });

    socket.on('content-update', (data) => {
      setContent(data.content);
    });

    socket.on('save-success', () => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });

    return () => {
      socket.emit('leave-document', { documentId: id });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [id, user]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setSaved(false);

    if (socketRef.current) {
      socketRef.current.emit('content-change', { documentId: id, content: newContent });
    }

    // Auto-save after 2s of inactivity
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(newContent);
    }, 2000);
  }, [id]);

  const handleSave = useCallback(async (contentToSave?: string) => {
    if (!id || access === 'read') return;
    setSaving(true);

    if (socketRef.current) {
      socketRef.current.emit('save-document', {
        documentId: id,
        content: contentToSave || content,
        title,
      });
    } else {
      try {
        await documentsApi.update(id, { content: contentToSave || content, title });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch {
        setSaving(false);
      }
    }
  }, [id, content, title, access]);

  // Keyboard shortcut: Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  const handleCreateInvite = async (permission: 'read' | 'edit') => {
    if (!id) return;
    try {
      const res = await documentsApi.createInvite(id, { permission });
      const link = `${window.location.origin}/documents/invite/${res.data.token}`;
      setInviteLink(link);
    } catch {
      // error
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!id) return;
    try {
      const res = await documentsApi.uploadImage(id, file);
      const imageUrl = res.data.url;
      const markdownImg = `![${file.name}](${imageUrl})`;

      if (textareaRef.current) {
        const start = textareaRef.current.selectionStart;
        const newContent = content.slice(0, start) + markdownImg + content.slice(start);
        handleContentChange(newContent);
      }
    } catch {
      // error
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(f => f.type.startsWith('image/'));
    if (imageFile) handleImageUpload(imageFile);
  };

  const handleExport = async () => {
    if (!id) return;
    try {
      const res = await documentsApi.exportPdf(id);
      const blob = new Blob([res.data], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'document'}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // error
    }
  };

  const insertMarkdown = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
    const { selectionStart, selectionEnd } = textareaRef.current;
    const selected = content.slice(selectionStart, selectionEnd);
    const newContent = content.slice(0, selectionStart) + before + selected + after + content.slice(selectionEnd);
    handleContentChange(newContent);

    // Restore cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = selectionStart + before.length + (selected ? selected.length : 0);
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          selected ? newPos + after.length : selectionStart + before.length,
          selected ? newPos + after.length : selectionStart + before.length
        );
      }
    }, 0);
  };

  // Simple markdown to HTML renderer
  const renderMarkdown = (md: string): string => {
    let html = md
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold and italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="lang-$1">$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Blockquotes
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      // Lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%" />')
      // Horizontal rule
      .replace(/^---$/gm, '<hr />')
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />');

    return `<p>${html}</p>`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 rounded-full"
             style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-accent)' }} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Toolbar */}
      <div className="glass-card p-3 mb-3 flex items-center gap-2 flex-wrap" style={{ borderRadius: '0.75rem' }}>
        <button onClick={() => navigate('/documents')} className="btn-secondary text-sm py-1 px-3">
          Back
        </button>

        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setSaved(false); }}
          className="input-field flex-1 min-w-48 text-sm"
          placeholder="Document title..."
          style={{ maxWidth: '300px' }}
        />

        <div className="flex gap-1">
          <button onClick={() => insertMarkdown('**', '**')} className="btn-secondary text-sm py-1 px-2 font-bold" title="Bold">B</button>
          <button onClick={() => insertMarkdown('*', '*')} className="btn-secondary text-sm py-1 px-2 italic" title="Italic">I</button>
          <button onClick={() => insertMarkdown('# ')} className="btn-secondary text-sm py-1 px-2" title="Heading">H</button>
          <button onClick={() => insertMarkdown('`', '`')} className="btn-secondary text-sm py-1 px-2 font-mono" title="Code">&lt;&gt;</button>
          <button onClick={() => insertMarkdown('- ')} className="btn-secondary text-sm py-1 px-2" title="List">List</button>
          <button onClick={() => insertMarkdown('[', '](url)')} className="btn-secondary text-sm py-1 px-2" title="Link">Link</button>
        </div>

        <label className="btn-secondary text-sm py-1 px-2 cursor-pointer" title="Upload Image">
          Img
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }}
          />
        </label>

        <button onClick={() => setShowPreview(!showPreview)} className="btn-secondary text-sm py-1 px-2">
          {showPreview ? 'Editor Only' : 'Split View'}
        </button>

        <button onClick={handleExport} className="btn-secondary text-sm py-1 px-2" title="Export">
          Export
        </button>

        {access === 'owner' && (
          <button onClick={() => setShowShareModal(true)} className="btn-primary text-sm py-1 px-3">
            Share
          </button>
        )}

        <div className="flex items-center gap-1 ml-auto">
          {/* Connected users */}
          {connectedUsers.filter(u => u.userId !== user?.id).map((u) => (
            <div
              key={u.userId}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: getUserColor(u.userId) }}
              title={u.username}
            >
              {u.username[0]?.toUpperCase()}
            </div>
          ))}

          <span className="text-xs ml-2" style={{ color: 'var(--color-text-secondary)' }}>
            {saving ? 'Saving...' : saved ? 'Saved' : access === 'read' ? 'Read-only' : ''}
          </span>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Editor */}
        <div className={`flex-1 ${showPreview ? 'w-1/2' : 'w-full'}`}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            readOnly={access === 'read'}
            className="w-full h-full p-4 resize-none font-mono rounded-xl focus:outline-none focus:ring-2"
            style={{
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              fontSize: `${settings?.editor_font_size || 14}px`,
              tabSize: settings?.editor_tab_size || 2,
              outlineColor: 'var(--color-accent)',
            }}
            placeholder="Start writing markdown..."
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div
            className="flex-1 w-1/2 p-4 overflow-auto rounded-xl prose-preview"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <div
              className="markdown-preview"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowShareModal(false)}>
          <div
            className="glass-card p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Share Document
            </h2>

            <div className="space-y-3 mb-4">
              <button
                onClick={() => handleCreateInvite('edit')}
                className="btn-primary w-full text-sm"
              >
                Create Edit Link
              </button>
              <button
                onClick={() => handleCreateInvite('read')}
                className="btn-secondary w-full text-sm"
              >
                Create Read-only Link
              </button>
            </div>

            {inviteLink && (
              <div className="mt-4">
                <label className="block text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Invite Link (expires in 72h)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="input-field text-sm flex-1"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(inviteLink)}
                    className="btn-secondary text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button onClick={() => setShowShareModal(false)} className="btn-secondary text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
