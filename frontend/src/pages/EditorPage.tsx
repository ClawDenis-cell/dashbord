import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentStore, useAuthStore, useSettingsStore } from '../store';
import { documentsApi } from '../api/documents';
import { io, Socket } from 'socket.io-client';
import { CodeMirrorEditor } from '../components/editor/CodeMirrorEditor';
import { EditorToolbar } from '../components/editor/EditorToolbar';
import { ShareModal } from '../components/editor/ShareModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

  // Memoized markdown components for react-markdown
  const markdownComponents = useMemo(() => ({
    code({ node, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const inline = !match && !String(children).includes('\n');
      if (!inline && match) {
        return (
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            customStyle={{ borderRadius: '8px', margin: '1em 0', fontSize: '0.9em' }}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        );
      }
      if (!inline) {
        return (
          <SyntaxHighlighter
            style={oneDark}
            language="text"
            PreTag="div"
            customStyle={{ borderRadius: '8px', margin: '1em 0', fontSize: '0.9em' }}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        );
      }
      return (
        <code className={className} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.15em 0.4em', borderRadius: '4px', fontSize: '0.9em' }} {...props}>
          {children}
        </code>
      );
    },
    img({ src, alt, ...props }: any) {
      return <img src={src} alt={alt || ''} style={{ maxWidth: '100%', borderRadius: '8px', margin: '1em 0' }} {...props} />;
    },
    a({ href, children, ...props }: any) {
      return <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent, #60a5fa)' }} {...props}>{children}</a>;
    },
    table({ children, ...props }: any) {
      return (
        <div style={{ overflowX: 'auto', margin: '1em 0' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }} {...props}>{children}</table>
        </div>
      );
    },
    th({ children, ...props }: any) {
      return <th style={{ border: '1px solid var(--color-border, #444)', padding: '0.5em 1em', textAlign: 'left', background: 'rgba(255,255,255,0.05)' }} {...props}>{children}</th>;
    },
    td({ children, ...props }: any) {
      return <td style={{ border: '1px solid var(--color-border, #444)', padding: '0.5em 1em' }} {...props}>{children}</td>;
    },
    blockquote({ children, ...props }: any) {
      return (
        <blockquote style={{ borderLeft: '4px solid var(--color-accent, #60a5fa)', paddingLeft: '1em', margin: '1em 0', color: 'var(--color-text-secondary, #aaa)', fontStyle: 'italic' }} {...props}>
          {children}
        </blockquote>
      );
    },
    hr() {
      return <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #444)', margin: '2em 0' }} />;
    },
    h1({ children, ...props }: any) {
      return <h1 style={{ fontSize: '2em', fontWeight: 700, margin: '0.8em 0 0.4em', lineHeight: 1.2, borderBottom: '1px solid var(--color-border, #333)', paddingBottom: '0.3em' }} {...props}>{children}</h1>;
    },
    h2({ children, ...props }: any) {
      return <h2 style={{ fontSize: '1.5em', fontWeight: 600, margin: '0.8em 0 0.4em', lineHeight: 1.3, borderBottom: '1px solid var(--color-border, #333)', paddingBottom: '0.3em' }} {...props}>{children}</h2>;
    },
    h3({ children, ...props }: any) {
      return <h3 style={{ fontSize: '1.25em', fontWeight: 600, margin: '0.8em 0 0.4em', lineHeight: 1.4 }} {...props}>{children}</h3>;
    },
    ul({ children, ...props }: any) {
      return <ul style={{ paddingLeft: '1.5em', margin: '0.5em 0', listStyleType: 'disc' }} {...props}>{children}</ul>;
    },
    ol({ children, ...props }: any) {
      return <ol style={{ paddingLeft: '1.5em', margin: '0.5em 0', listStyleType: 'decimal' }} {...props}>{children}</ol>;
    },
    li({ children, ...props }: any) {
      return <li style={{ margin: '0.25em 0', lineHeight: 1.6 }} {...props}>{children}</li>;
    },
    p({ children, ...props }: any) {
      return <p style={{ margin: '0.75em 0', lineHeight: 1.7 }} {...props}>{children}</p>;
    },
    pre({ children }: any) {
      return <>{children}</>;
    },
  }), []);

  const handleImportMarkdown = (importedContent: string) => {
    handleContentChange(importedContent);
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
        onImportMarkdown={handleImportMarkdown}
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
            <div className="markdown-preview prose-preview">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={markdownComponents}
              >
                {content}
              </ReactMarkdown>
            </div>
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
