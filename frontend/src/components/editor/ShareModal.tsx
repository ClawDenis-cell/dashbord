import React, { useState, useEffect, useCallback } from 'react';
import { documentsApi, DocumentCollaborator } from '../../api/documents';

interface ShareModalProps {
  documentId: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ documentId, onClose }) => {
  const [collaborators, setCollaborators] = useState<DocumentCollaborator[]>([]);
  const [inviteLink, setInviteLink] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; username: string; email: string }>>([]);
  const [selectedPermission, setSelectedPermission] = useState<'read' | 'edit'>('edit');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'collaborators' | 'invite'>('collaborators');

  const fetchCollaborators = useCallback(async () => {
    try {
      const res = await documentsApi.getCollaborators(documentId);
      setCollaborators(res.data);
    } catch {
      // error
    }
  }, [documentId]);

  useEffect(() => {
    fetchCollaborators();
  }, [fetchCollaborators]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await documentsApi.searchUsers(query);
      // Filter out existing collaborators
      const existingIds = new Set(collaborators.map(c => c.user_id));
      setSearchResults((res.data || []).filter((u: any) => !existingIds.has(u.id)));
    } catch {
      setSearchResults([]);
    }
  }, [collaborators]);

  const handleAddCollaborator = async (userId: string) => {
    try {
      await documentsApi.addCollaborator(documentId, { user_id: userId, permission: selectedPermission });
      setSearchQuery('');
      setSearchResults([]);
      fetchCollaborators();
    } catch {
      // error
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    try {
      await documentsApi.removeCollaborator(documentId, userId);
      fetchCollaborators();
    } catch {
      // error
    }
  };

  const handleUpdatePermission = async (userId: string, permission: 'read' | 'edit') => {
    try {
      await documentsApi.addCollaborator(documentId, { user_id: userId, permission });
      fetchCollaborators();
    } catch {
      // error
    }
  };

  const handleCreateInvite = async (permission: 'read' | 'edit') => {
    setLoading(true);
    try {
      const res = await documentsApi.createInvite(documentId, { permission });
      const link = `${window.location.origin}/documents/invite/${res.data.token}`;
      setInviteLink(link);
    } catch {
      // error
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="glass-card p-6 w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '80vh', overflow: 'auto' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Share Document
          </h2>
          <button onClick={onClose} className="btn-secondary text-sm py-1 px-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ background: 'var(--color-bg-primary)' }}>
          <button
            onClick={() => setActiveTab('collaborators')}
            className={`flex-1 text-sm py-1.5 px-3 rounded-md transition-colors ${activeTab === 'collaborators' ? 'glass-card' : ''}`}
            style={{ color: activeTab === 'collaborators' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
          >
            Collaborators ({collaborators.length})
          </button>
          <button
            onClick={() => setActiveTab('invite')}
            className={`flex-1 text-sm py-1.5 px-3 rounded-md transition-colors ${activeTab === 'invite' ? 'glass-card' : ''}`}
            style={{ color: activeTab === 'invite' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
          >
            Invite Link
          </button>
        </div>

        {activeTab === 'collaborators' && (
          <div>
            {/* Search to add */}
            <div className="mb-4">
              <label className="block text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Add collaborator
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="input-field text-sm flex-1"
                  placeholder="Search by username or email..."
                />
                <select
                  value={selectedPermission}
                  onChange={(e) => setSelectedPermission(e.target.value as 'read' | 'edit')}
                  className="input-field text-sm w-24"
                >
                  <option value="edit">Edit</option>
                  <option value="read">Read</option>
                </select>
              </div>

              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="mt-2 rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleAddCollaborator(user.id)}
                      className="w-full flex items-center justify-between p-2.5 text-sm hover:bg-white/5 transition-colors"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      <div>
                        <span className="font-medium">{user.username}</span>
                        <span className="ml-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {user.email}
                        </span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--color-accent)', color: 'white' }}>
                        Add
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Current collaborators */}
            {collaborators.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-secondary)' }}>
                No collaborators yet. Search to add one.
              </p>
            ) : (
              <div className="space-y-2">
                {collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="flex items-center justify-between p-2.5 rounded-lg"
                    style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}
                  >
                    <div>
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {collab.username}
                      </span>
                      <span className="ml-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {collab.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={collab.permission}
                        onChange={(e) => handleUpdatePermission(collab.user_id, e.target.value as 'read' | 'edit')}
                        className="input-field text-xs py-0.5 px-1.5 w-20"
                      >
                        <option value="edit">Edit</option>
                        <option value="read">Read</option>
                      </select>
                      <button
                        onClick={() => handleRemoveCollaborator(collab.user_id)}
                        className="text-xs px-1.5 py-0.5 rounded transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                        onMouseOver={(e) => (e.currentTarget.style.color = '#f87171')}
                        onMouseOut={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                        title="Remove collaborator"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'invite' && (
          <div>
            <div className="space-y-3 mb-4">
              <button
                onClick={() => handleCreateInvite('edit')}
                className="btn-primary w-full text-sm"
                disabled={loading}
              >
                Create Edit Link
              </button>
              <button
                onClick={() => handleCreateInvite('read')}
                className="btn-secondary w-full text-sm"
                disabled={loading}
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
          </div>
        )}
      </div>
    </div>
  );
};
