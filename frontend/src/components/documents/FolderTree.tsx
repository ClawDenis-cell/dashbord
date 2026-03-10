import React, { useState } from 'react';

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  user_id: string;
  created_at: string;
}

interface FolderTreeProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string, parentId: string | null) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onMoveDocument: (documentId: string, folderId: string | null) => void;
}

interface FolderNodeProps {
  folder: Folder;
  allFolders: Folder[];
  depth: number;
  selectedFolderId: string | null;
  onSelect: (id: string | null) => void;
  onCreateFolder: (name: string, parentId: string | null) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onMoveDocument: (documentId: string, folderId: string | null) => void;
  expandedFolders: Set<string>;
  toggleExpand: (id: string) => void;
}

const FolderNode: React.FC<FolderNodeProps> = ({
  folder,
  allFolders,
  depth,
  selectedFolderId,
  onSelect,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveDocument,
  expandedFolders,
  toggleExpand,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameName, setRenameName] = useState(folder.name);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const isExpanded = expandedFolders.has(folder.id);
  const isSelected = selectedFolderId === folder.id;
  const childFolders = allFolders.filter(f => f.parent_id === folder.id);

  const handleRename = () => {
    if (renameName.trim() && renameName !== folder.name) {
      onRenameFolder(folder.id, renameName.trim());
    }
    setIsRenaming(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).style.background = 'rgba(124,58,237,0.15)';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).style.background = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).style.background = '';
    const documentId = e.dataTransfer.getData('text/document-id');
    if (documentId) {
      onMoveDocument(documentId, folder.id);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-colors group ${isSelected ? 'ring-1' : ''}`}
        style={{
          paddingLeft: `${depth * 16 + 8}px`,
          background: isSelected ? 'rgba(124,58,237,0.1)' : 'transparent',
          borderColor: isSelected ? 'var(--color-accent)' : 'transparent',
          color: isSelected ? 'var(--color-accent)' : 'var(--color-text-primary)',
        }}
        onClick={() => onSelect(folder.id)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onContextMenu={(e) => { e.preventDefault(); setShowContextMenu(!showContextMenu); }}
      >
        {/* Expand arrow */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleExpand(folder.id); }}
          className="w-4 h-4 flex items-center justify-center flex-shrink-0"
        >
          {childFolders.length > 0 ? (
            <svg
              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : <span className="w-3" />}
        </button>

        {/* Folder icon */}
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          style={{ color: isSelected ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
        >
          {isExpanded ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          )}
        </svg>

        {/* Name */}
        {isRenaming ? (
          <input
            type="text"
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setIsRenaming(false); }}
            className="input-field text-xs py-0 px-1 flex-1"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-sm truncate flex-1">{folder.name}</span>
        )}

        {/* Context menu trigger */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowContextMenu(!showContextMenu); }}
          className="w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      </div>

      {/* Context menu */}
      {showContextMenu && (
        <div
          className="ml-8 mb-1 glass-card p-1 text-xs shadow-xl"
          style={{ border: '1px solid var(--color-border)' }}
        >
          <button
            onClick={() => { onCreateFolder('New Folder', folder.id); setShowContextMenu(false); }}
            className="w-full text-left py-1 px-2 rounded hover:bg-white/5"
            style={{ color: 'var(--color-text-primary)' }}
          >
            New Subfolder
          </button>
          <button
            onClick={() => { setIsRenaming(true); setShowContextMenu(false); }}
            className="w-full text-left py-1 px-2 rounded hover:bg-white/5"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Rename
          </button>
          <button
            onClick={() => { onDeleteFolder(folder.id); setShowContextMenu(false); }}
            className="w-full text-left py-1 px-2 rounded hover:bg-white/5 text-red-400"
          >
            Delete
          </button>
        </div>
      )}

      {/* Children */}
      {isExpanded && childFolders.map((child) => (
        <FolderNode
          key={child.id}
          folder={child}
          allFolders={allFolders}
          depth={depth + 1}
          selectedFolderId={selectedFolderId}
          onSelect={onSelect}
          onCreateFolder={onCreateFolder}
          onRenameFolder={onRenameFolder}
          onDeleteFolder={onDeleteFolder}
          onMoveDocument={onMoveDocument}
          expandedFolders={expandedFolders}
          toggleExpand={toggleExpand}
        />
      ))}
    </div>
  );
};

export const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveDocument,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const rootFolders = folders.filter(f => !f.parent_id);

  const handleCreateRoot = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), null);
      setNewFolderName('');
      setCreatingFolder(false);
    }
  };

  const handleRootDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const documentId = e.dataTransfer.getData('text/document-id');
    if (documentId) {
      onMoveDocument(documentId, '');  // empty = root
    }
  };

  return (
    <div className="text-sm">
      {/* All Documents (root) */}
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors mb-1 ${selectedFolderId === null ? 'ring-1' : ''}`}
        style={{
          background: selectedFolderId === null ? 'rgba(124,58,237,0.1)' : 'transparent',
          borderColor: selectedFolderId === null ? 'var(--color-accent)' : 'transparent',
          color: selectedFolderId === null ? 'var(--color-accent)' : 'var(--color-text-primary)',
        }}
        onClick={() => onSelectFolder(null)}
        onDragOver={handleRootDragOver}
        onDrop={handleRootDrop}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span className="font-medium">All Documents</span>
      </div>

      {/* Folder tree */}
      {rootFolders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          allFolders={folders}
          depth={0}
          selectedFolderId={selectedFolderId}
          onSelect={onSelectFolder}
          onCreateFolder={onCreateFolder}
          onRenameFolder={onRenameFolder}
          onDeleteFolder={onDeleteFolder}
          onMoveDocument={onMoveDocument}
          expandedFolders={expandedFolders}
          toggleExpand={toggleExpand}
        />
      ))}

      {/* New folder */}
      {creatingFolder ? (
        <div className="flex items-center gap-1 px-2 py-1 mt-1">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-text-secondary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onBlur={handleCreateRoot}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreateRoot(); if (e.key === 'Escape') { setCreatingFolder(false); setNewFolderName(''); } }}
            className="input-field text-xs py-0 px-1 flex-1"
            placeholder="Folder name..."
            autoFocus
          />
        </div>
      ) : (
        <button
          onClick={() => setCreatingFolder(true)}
          className="flex items-center gap-2 px-2 py-1.5 mt-1 w-full rounded transition-colors hover:bg-white/5 text-xs"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Folder
        </button>
      )}
    </div>
  );
};
