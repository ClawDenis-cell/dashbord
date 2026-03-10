import React from 'react';
import { Ticket } from '../../types';
import { useTicketStore } from '../../store';

interface TicketCardProps {
  ticket: Ticket;
  onEdit: (ticket: Ticket) => void;
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-200 text-gray-800',
  medium: 'bg-yellow-200 text-yellow-800',
  high: 'bg-red-200 text-red-800',
};

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onEdit }) => {
  const { deleteTicket } = useTicketStore();

  return (
    <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-sm">{ticket.title}</h4>
        <button
          onClick={() => deleteTicket(ticket.id)}
          className="text-gray-400 hover:text-red-500 text-xs"
        >
          ×
        </button>
      </div>
      <p className="text-gray-600 text-xs mt-1">{ticket.description}</p>
      <div className="flex justify-between items-center mt-2">
        <span className={`text-xs px-2 py-1 rounded ${priorityColors[ticket.priority] || 'bg-gray-200'}`}>
          {ticket.priority}
        </span>
        <button
          onClick={() => onEdit(ticket)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Edit
        </button>
      </div>
    </div>
  );
};
