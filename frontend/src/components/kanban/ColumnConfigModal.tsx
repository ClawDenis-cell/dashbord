import React, { useState } from 'react';
import { useKanbanConfigStore } from '../../store';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface ColumnConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ColumnConfigModal: React.FC<ColumnConfigModalProps> = ({ isOpen, onClose }) => {
  const { defaultColumns, updateConfig } = useKanbanConfigStore();
  const [columns, setColumns] = useState<string[]>(defaultColumns);
  const [newColumn, setNewColumn] = useState('');

  const handleAddColumn = () => {
    if (newColumn.trim()) {
      setColumns([...columns, newColumn.trim()]);
      setNewColumn('');
    }
  };

  const handleRemoveColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleMoveColumn = (index: number, direction: 'up' | 'down') => {
    const newColumns = [...columns];
    if (direction === 'up' && index > 0) {
      [newColumns[index], newColumns[index - 1]] = [newColumns[index - 1], newColumns[index]];
    } else if (direction === 'down' && index < columns.length - 1) {
      [newColumns[index], newColumns[index + 1]] = [newColumns[index + 1], newColumns[index]];
    }
    setColumns(newColumns);
  };

  const handleSave = async () => {
    await updateConfig(columns);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Kanban Columns">
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newColumn}
            onChange={(e) => setNewColumn(e.target.value)}
            placeholder="New column name"
            className="input-field flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
          />
          <Button onClick={handleAddColumn} size="sm">
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {columns.map((column, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2.5 rounded-lg"
              style={{ background: 'var(--color-bg-tertiary)' }}
            >
              <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{column}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleMoveColumn(index, 'up')}
                  disabled={index === 0}
                  className="px-1.5 rounded transition-colors disabled:opacity-30"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ^
                </button>
                <button
                  onClick={() => handleMoveColumn(index, 'down')}
                  disabled={index === columns.length - 1}
                  className="px-1.5 rounded transition-colors disabled:opacity-30"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  v
                </button>
                <button
                  onClick={() => handleRemoveColumn(index)}
                  className="px-1.5 ml-1 rounded transition-colors"
                  style={{ color: '#f87171' }}
                >
                  x
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Modal>
  );
};
