import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDocumentStore } from '../store';
import { documentsApi, DocumentFolder } from '../api/documents';
import { FolderTree } from '../components/documents/FolderTree';

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

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { documents, loading, fetchDocuments, createDocument, deleteDocument } = useDocumentStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchFolders = useCallback(async () => {
    try {
      const res = await documentsApi.getFolders();
      setFolders(res.data);
    } catch {
      // May not be supported yet, silently fail
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    fetchFolders();
  }, [fetchDocuments, fetchFolders]);

  // Filter documents by selected folder
  const filteredDocuments = selectedFolderId
    ? documents.filter(d => (d as any).folder_id === selectedFolderId)
    : documents;

  // Build breadcrumbs
  const getBreadcrumbs = (): Array<{ id: string | null; name: string }> => {
    const crumbs: Array<{ id: string | null; name: string }> = [{ id: null, name: 'All Documents' }];
    if (!selectedFolderId) return crumbs;

    const buildPath = (folderId: string) => {
      const folder = folders.find(f => f.id === folderId);
      if (!folder) return;
      if (folder.parent_id) buildPath(folder.parent_id);
      crumbs.push({ id: folder.id, name: folder.name });
    };
    buildPath(selectedFolderId);
    return crumbs;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const doc = await createDocument({
        title: newTitle,
        ...(selectedFolderId ? { folder_id: selectedFolderId } : {}),
      } as any);
      setNewTitle('');
      setShowCreateModal(false);
      navigate(`/documents/${doc.id}`);
    } catch {
      // Error handled in store
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    try {
      await deleteDocument(id);
    } catch {
      // Error handled in store
    }
  };

  const handleCreateFolder = async (name: string, parentId: string | null) => {
    try {
      await documentsApi.createFolder({ name, parent_id: parentId });
      fetchFolders();
    } catch {
      // error
    }
  };

  const handleRenameFolder = async (id: string, name: string) => {
    try {
      await documentsApi.updateFolder(id, { name });
      fetchFolders();
    } catch {
      // error
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!confirm('Delete this folder? Documents inside will be moved to root.')) return;
    try {
      await documentsApi.deleteFolder(id);
      if (selectedFolderId === id) setSelectedFolderId(null);
      fetchFolders();
      fetchDocuments();
    } catch {
      // error
    }
  };

  const handleMoveDocument = async (documentId: string, folderId: string | null) => {
    try {
      await documentsApi.moveDocument(documentId, folderId || null);
      fetchDocuments();
    } catch {
      // error
    }
  };

  const handleDocumentDragStart = (e: React.DragEvent<HTMLDivElement>, documentId: string) => {
    e.dataTransfer.setData('text/document-id', documentId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)]">
      {/* Sidebar with folder tree */}
      {sidebarOpen && (
        <div
          className="w-56 flex-shrink-0 glass-card p-3 overflow-auto"
          style={{ borderRadius: '0.75rem' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              Folders
            </h3>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
          <FolderTree
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
            onCreateFolder={handleCreateFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
            onMoveDocument={handleMoveDocument}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="btn-secondary text-sm py-1 px-2"
                title="Show folders"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </button>
            )}

            {/* Breadcrumbs */}
            <div className="flex items-center gap-1 text-sm">
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={crumb.id ?? 'root'}>
                  {i > 0 && (
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-text-secondary)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                  <button
                    onClick={() => setSelectedFolderId(crumb.id)}
                    className={`hover:underline ${i === breadcrumbs.length - 1 ? 'font-semibold' : ''}`}
                    style={{ color: i === breadcrumbs.length - 1 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                  >
                    {crumb.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex gap-0.5 p-0.5 rounded-lg" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white/10' : ''}`}
                style={{ color: viewMode === 'grid' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded ${viewMode === 'list' ? 'bg-white/10' : ''}`}
                style={{ color: viewMode === 'list' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <button onClick={() => setShowCreateModal(true)} className="btn-primary text-sm">
              New Document
            </button>
          </div>
        </div>

        {/* Documents */}
        {loading && documents.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--color-text-secondary)' }}>
            Loading...
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12 glass-card" style={{ borderRadius: '0.75rem' }}>
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-text-secondary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg mb-2" style={{ color: 'var(--color-text-primary)' }}>
              {selectedFolderId ? 'This folder is empty' : 'No documents yet'}
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Create your first document to get started.
            </p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              Create Document
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-auto">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="glass-card p-4 cursor-pointer hover:border-opacity-50 transition-all group"
                style={{ borderColor: 'var(--color-border)', borderRadius: '0.75rem' }}
                onClick={() => navigate(`/documents/${doc.id}`)}
                draggable
                onDragStart={(e) => handleDocumentDragStart(e, doc.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold truncate flex-1" style={{ color: 'var(--color-text-primary)' }}>
                    {doc.title}
                  </h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                    className="text-sm px-2 py-1 rounded transition-all opacity-0 group-hover:opacity-100"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseOver={(e) => (e.currentTarget.style.color = '#f87171')}
                    onMouseOut={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs line-clamp-3 mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                  {doc.content?.substring(0, 150) || 'Empty document'}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                  {formatRelativeTime(doc.updated_at)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1 overflow-auto">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="glass-card px-4 py-2.5 cursor-pointer hover:border-opacity-50 transition-all flex items-center gap-4 group"
                style={{ borderColor: 'var(--color-border)', borderRadius: '0.5rem' }}
                onClick={() => navigate(`/documents/${doc.id}`)}
                draggable
                onDragStart={(e) => handleDocumentDragStart(e, doc.id)}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-text-secondary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {doc.title}
                  </h3>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                  {formatRelativeTime(doc.updated_at)}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                  className="text-sm rounded transition-all opacity-0 group-hover:opacity-100 p-1"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#f87171')}
                  onMouseOut={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreateModal(false)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              New Document
            </h2>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Document title..."
                className="input-field mb-2"
                autoFocus
              />
              {selectedFolderId && (
                <p className="text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                  Creating in: {folders.find(f => f.id === selectedFolderId)?.name || 'folder'}
                </p>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
