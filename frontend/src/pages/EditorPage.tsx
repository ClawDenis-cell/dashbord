import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentStore, useAuthStore, useSettingsStore } from '../store';
import { documentsApi } from '../api/documents';
import { io, Socket } from 'socket.io-client';
import { CodeMirrorEditor } from '../components/editor/CodeMirrorEditor';
import { EditorToolbar } from '../components/editor/EditorToolbar';
import { ShareModal } from '../components/editor/ShareModal';

interface ConnectedUser {
  userId: string;
  username: string;
  cursor?: { line: number; ch: number };
}

export const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentDocument, fetchDocument, loading } = useDocumentStore();
  const { settings, updateSettings } = useSettingsStore();

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [access, setAccess] = useState<string>('owner');
  const [showShareModal, setShowShareModal] = useState(false);
  const [vimMode, setVimMode] = useState(settings?.vim_mode || false);
  const socketRef = useRef<Socket | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const fullscreenRef = useRef<HTMLDivElement>(null);

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

  // Sync vim mode from settings
  useEffect(() => {
    if (settings?.vim_mode !== undefined) {
      setVimMode(settings.vim_mode);
    }
  }, [settings?.vim_mode]);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave, isFullscreen]);

  const handleImageUpload = async (file: File) => {
    if (!id) return;
    try {
      const res = await documentsApi.uploadImage(id, file);
      const imageUrl = res.data.url;
      const markdownImg = `![${file.name}](${imageUrl})`;
      handleContentChange(content + '\n' + markdownImg);
    } catch {
      // error
    }
  };

  const handleImageUrlPaste = async (url: string) => {
    if (!id) return;
    try {
      const res = await documentsApi.uploadImageUrl(id, url);
      const imageUrl = res.data.url;
      const markdownImg = `![image](${imageUrl})`;
      handleContentChange(content + '\n' + markdownImg);
    } catch {
      // Fallback: just insert the URL directly
      const markdownImg = `![image](${url})`;
      handleContentChange(content + '\n' + markdownImg);
    }
  };

  const handleExportHtml = async () => {
    if (!id) return;
    try {
      const res = await documentsApi.exportHtml(id);
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

  const handleExportPdf = async () => {
    if (!id) return;
    try {
      const res = await documentsApi.exportPdf(id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'document'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback to HTML export
      handleExportHtml();
    }
  };

  const handleInsertMarkdown = (before: string, after: string = '') => {
    // This is a simple insert at end for toolbar buttons
    // The CodeMirror editor handles its own cursor-based insertions
    const newContent = content + before + after;
    handleContentChange(newContent);
  };

  const handleToggleVim = () => {
    const newVimMode = !vimMode;
    setVimMode(newVimMode);
    // Persist to settings
    updateSettings({ vim_mode: newVimMode }).catch(() => {});
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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
      // Strikethrough
      .replace(/~~(.+?)~~/g, '<del>$1</del>')
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="lang-$1">$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Blockquotes
      .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
      // Task lists
      .replace(/^- \[x\] (.+)$/gm, '<li class="task done"><input type="checkbox" checked disabled /> $1</li>')
      .replace(/^- \[ \] (.+)$/gm, '<li class="task"><input type="checkbox" disabled /> $1</li>')
      // Lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px" />')
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

  const editorContent = (
    <div
      ref={fullscreenRef}
      className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-40 p-4' : 'h-[calc(100vh-120px)]'}`}
      style={isFullscreen ? { background: 'var(--color-bg-primary)' } : {}}
    >
      {/* Toolbar */}
      <EditorToolbar
        title={title}
        onTitleChange={(t) => { setTitle(t); setSaved(false); }}
        onBack={() => navigate('/documents')}
        onInsertMarkdown={handleInsertMarkdown}
        onImageUpload={handleImageUpload}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview(!showPreview)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onExport={handleExportHtml}
        onExportPdf={handleExportPdf}
        access={access}
        onShare={() => setShowShareModal(true)}
        connectedUsers={connectedUsers}
        currentUserId={user?.id}
        saving={saving}
        saved={saved}
        vimMode={vimMode}
        onToggleVim={handleToggleVim}
        onUndo={() => {/* handled by CodeMirror */}}
        onRedo={() => {/* handled by CodeMirror */}}
        lastEdited={currentDocument?.updated_at}
      />

      {/* Editor Area */}
      <div className="flex-1 flex gap-2 min-h-0">
        {/* CodeMirror Editor */}
        <div className={`flex-1 ${showPreview ? 'w-1/2' : 'w-full'} min-h-0`}>
          <CodeMirrorEditor
            value={content}
            onChange={handleContentChange}
            readOnly={access === 'read'}
            vimMode={vimMode}
            fontSize={settings?.editor_font_size || 14}
            tabSize={settings?.editor_tab_size || 2}
            onSave={() => handleSave()}
            onImagePaste={handleImageUpload}
            onImageUrlPaste={handleImageUrlPaste}
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div
            className="flex-1 w-1/2 p-6 overflow-auto rounded-xl"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <div
              className="markdown-preview prose-preview"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && id && (
        <ShareModal
          documentId={id}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );

  return editorContent;
};
