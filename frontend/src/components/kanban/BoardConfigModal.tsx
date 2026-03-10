import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { KanbanBoard } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface BoardConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: KanbanBoard | null;
  onSave: (boardId: string, name: string, columns: string[]) => void;
}

export const BoardConfigModal: React.FC<BoardConfigModalProps> = ({
  isOpen,
  onClose,
  board,
  onSave
}) => {
  const [boardName, setBoardName] = useState('');
  const [columns, setColumns] = useState<string[]>([]);
  const [newColumnName, setNewColumnName] = useState('');

  useEffect(() => {
    if (board) {
      setBoardName(board.name);
      setColumns([...board.columns_array]);
    }
  }, [board, isOpen]);

  const handleAddColumn = () => {
    if (newColumnName.trim() && !columns.includes(newColumnName.trim())) {
      setColumns([...columns, newColumnName.trim()]);
      setNewColumnName('');
    }
  };

  const handleRemoveColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleMoveColumn = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newColumns = [...columns];
      [newColumns[index], newColumns[index - 1]] = [newColumns[index - 1], newColumns[index]];
      setColumns(newColumns);
    } else if (direction === 'down' && index < columns.length - 1) {
      const newColumns = [...columns];
      [newColumns[index], newColumns[index + 1]] = [newColumns[index + 1], newColumns[index]];
      setColumns(newColumns);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (board && boardName.trim() && columns.length > 0) {
      onSave(board.id, boardName.trim(), columns);
      onClose();
    }
  };

  if (!board) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Board">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Board Name"
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Columns ({columns.length})
          </label>
          
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {columns.map((column, index) => (
              <motion.div
                key={`${column}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-2 rounded-lg"
                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
              >
                <span className="flex-1" style={{ color: 'var(--color-text-primary)' }}>
                  {column}
                </span>
                
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveColumn(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveColumn(index, 'down')}
                    disabled={index === columns.length - 1}
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveColumn(index)}
                    className="p-1 rounded hover:bg-red-500/20 transition-colors"
                    style={{ color: 'var(--color-error)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="New column name"
              className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--color-bg-primary)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColumn())}
            />
            <Button type="button" onClick={handleAddColumn} variant="secondary">
              Add
            </Button>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <Button type="submit" className="flex-1">
            Save Changes
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};