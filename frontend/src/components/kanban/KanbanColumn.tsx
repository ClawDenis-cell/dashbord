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
      className={`flex-1 min-w-[250px] bg-gray-100 rounded-lg p-4 ${
        isDragOver ? 'bg-blue-50 border-2 border-blue-300' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h3 className="font-semibold text-gray-700 mb-3">{name} ({tickets.length})</h3>
      <div className="space-y-2">
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
