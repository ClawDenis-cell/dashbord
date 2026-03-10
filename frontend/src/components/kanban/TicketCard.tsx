import React from 'react';
import { motion } from 'framer-motion';
import { Ticket } from '../../types';
import { useTicketStore } from '../../store';

interface TicketCardProps {
  ticket: Ticket;
  onEdit: (ticket: Ticket) => void;
}

const priorityConfig: Record<string, { bg: string; text: string; dot: string }> = {
  low: { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', dot: '#22c55e' },
  medium: { bg: 'rgba(234, 179, 8, 0.15)', text: '#facc15', dot: '#eab308' },
  high: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', dot: '#ef4444' },
};

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onEdit }) => {
  const { deleteTicket } = useTicketStore();
  const priority = priorityConfig[ticket.priority] || priorityConfig.medium;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="glass-card-sm p-3 transition-shadow duration-200"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
          {ticket.title}
        </h4>
        <button
          onClick={() => deleteTicket(ticket.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs w-5 h-5 flex items-center justify-center rounded"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseOver={(e) => e.currentTarget.style.color = '#f87171'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
        >
          x
        </button>
      </div>
      {ticket.description && (
        <p className="text-xs mt-1.5 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
          {ticket.description}
        </p>
      )}
      <div className="flex justify-between items-center mt-3">
        <span
          className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1.5"
          style={{ background: priority.bg, color: priority.text }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: priority.dot }} />
          {ticket.priority}
        </span>
        <button
          onClick={() => onEdit(ticket)}
          className="text-xs transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
        >
          Edit
        </button>
      </div>
    </motion.div>
  );
};
