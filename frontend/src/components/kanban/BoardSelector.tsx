import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KanbanBoard } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';

interface BoardSelectorProps {
  boards: KanbanBoard[];
  currentBoard: KanbanBoard | null;
  onSelectBoard: (board: KanbanBoard) => void;
  onCreateBoard: (name: string, columns: string[]) => void;
  onDeleteBoard: (boardId: string) => void;
}

export const BoardSelector: React.FC<BoardSelectorProps> = ({
  boards,
  currentBoard,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardColumns, setNewBoardColumns] = useState('To Do, In Progress, Done');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      const columns = newBoardColumns.split(',').map(c => c.trim()).filter(c => c);
      onCreateBoard(newBoardName.trim(), columns.length > 0 ? columns : ['To Do', 'In Progress', 'Done']);
      setNewBoardName('');
      setNewBoardColumns('To Do, In Progress, Done');
      setIsCreateModalOpen(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, board: KanbanBoard) => {
    e.stopPropagation();
    if (boards.length > 1 && confirm(`Delete board "${board.name}"?`)) {
      onDeleteBoard(board.id);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
          style={{ 
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)'
          }}
        >
          <span>{currentBoard?.name || 'Select Board'}</span>
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <Button 
          variant="secondary" 
          onClick={() => setIsCreateModalOpen(true)}
          className="text-sm"
        >
          + New Board
        </Button>
      </div>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-72 rounded-lg shadow-lg z-50"
            style={{ 
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div className="p-2">
              {boards.length === 0 ? (
                <div className="p-4 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  No boards yet. Create one!
                </div>
              ) : (
                boards.map(board => (
                  <div
                    key={board.id}
                    onClick={() => {
                      onSelectBoard(board);
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors group"
                    style={{ 
                      backgroundColor: currentBoard?.id === board.id ? 'var(--color-accent)' : 'transparent',
                      color: currentBoard?.id === board.id ? 'white' : 'var(--color-text-primary)'
                    }}
                    onMouseEnter={(e) => {
                      if (currentBoard?.id !== board.id) {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentBoard?.id !== board.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div>
                      <div className="font-medium">{board.name}</div>
                      <div className="text-xs opacity-70">
                        {board.columns_array.length} columns
                      </div>
                    </div>
                    {boards.length > 1 && (
                      <button
                        onClick={(e) => handleDelete(e, board)}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                        style={{ color: 'var(--color-error)' }}
                        title="Delete board"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* Create Board Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Board"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Board Name"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="e.g., Sprint 1, Backlog, Ideas"
            required
          />
          
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Columns (comma-separated)
            </label>
            <input
              type="text"
              value={newBoardColumns}
              onChange={(e) => setNewBoardColumns(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--color-bg-primary)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
              placeholder="To Do, In Progress, Done"
            />
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
              Separate column names with commas
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">
              Create Board
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};