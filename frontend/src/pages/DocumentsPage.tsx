import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDocumentStore } from '../store';

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { documents, loading, fetchDocuments, createDocument, deleteDocument } = useDocumentStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const doc = await createDocument({ title: newTitle });
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Documents
        </h1>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          New Document
        </button>
      </div>

      {loading && documents.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'var(--color-text-secondary)' }}>
          Loading...
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 glass-card">
          <p className="text-lg mb-2" style={{ color: 'var(--color-text-primary)' }}>No documents yet</p>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Create your first document to get started.
          </p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            Create Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 cursor-pointer hover:border-opacity-50 transition-all"
              style={{ borderColor: 'var(--color-border)' }}
              onClick={() => navigate(`/documents/${doc.id}`)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {doc.title}
                </h3>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                  className="text-sm px-2 py-1 rounded transition-colors"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#f87171')}
                  onMouseOut={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                >
                  Delete
                </button>
              </div>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                {doc.content?.substring(0, 100) || 'Empty document'}
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                Updated {new Date(doc.updated_at).toLocaleDateString()}
              </p>
            </motion.div>
          ))}
        </div>
      )}

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
                className="input-field mb-4"
                autoFocus
              />
              <div className="flex justify-end gap-2">
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
