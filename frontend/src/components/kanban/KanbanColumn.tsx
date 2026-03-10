import type React from 'react';
import { useState } from 'react';
import { Ticket } from '../../types';
import { TicketCard } from './TicketCard';

interface KanbanColumnProps {
  name: string;
  tickets: Ticket[];
  onDrop: (ticketId: string, columnName: string) => void;
  onEditTicket: (ticket: Ticket) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  name,
  tickets,
  onDrop,
  onEditTicket,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const ticketId = e.dataTransfer.getData('ticketId');
    if (ticketId) {
      onDrop(ticketId, name);
    }
  };

  return (
    <div
      className="glass-card p-4 h-full transition-all duration-200"
      style={{
        borderColor: isDragOver ? 'var(--color-accent)' : undefined,
        boxShadow: isDragOver ? '0 0 0 2px rgba(139, 92, 246, 0.3)' : undefined,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {name}
        </h3>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
        >
          {tickets.length}
        </span>
      </div>
      <div className="space-y-3">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('ticketId', ticket.id)}
            className="cursor-move"
          >
            <TicketCard ticket={ticket} onEdit={onEditTicket} />
          </div>
        ))}
      </div>
    </div>
  );
};
