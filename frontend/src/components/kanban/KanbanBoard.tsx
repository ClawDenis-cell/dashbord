import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTicketStore, useKanbanConfigStore } from '../../store';
import { useProjectStore } from '../../store';
import { Ticket } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { Button } from '../common/Button';
import { TicketForm } from './TicketForm';
import { ColumnConfigModal } from './ColumnConfigModal';

export const KanbanBoard: React.FC = () => {
  const { tickets, fetchTickets, moveTicket } = useTicketStore();
  const { projects, fetchProjects } = useProjectStore();
  const { defaultColumns, fetchConfig } = useKanbanConfigStore();
  const [isTicketFormOpen, setIsTicketFormOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    fetchTickets();
    fetchProjects();
    fetchConfig();
  }, [fetchTickets, fetchProjects, fetchConfig]);

  const handleDrop = async (ticketId: string, columnName: string) => {
    await moveTicket(ticketId, columnName);
  };

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setIsTicketFormOpen(true);
  };

  const handleCreateTicket = () => {
    setEditingTicket(null);
    setIsTicketFormOpen(true);
  };

  const getTicketsByColumn = (columnName: string) => {
    return tickets.filter((ticket) => ticket.column_name === columnName);
  };

  return (
    <div className="h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Kanban Board
        </h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsConfigOpen(true)}>
            Configure
          </Button>
          <Button onClick={handleCreateTicket}>Add Ticket</Button>
        </div>
      </motion.div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 h-full min-w-max">
          {defaultColumns.map((column, index) => (
            <motion.div
              key={column}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-1 min-w-[280px]"
            >
              <KanbanColumn
                name={column}
                tickets={getTicketsByColumn(column)}
                onDrop={handleDrop}
                onEditTicket={handleEditTicket}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <TicketForm
        isOpen={isTicketFormOpen}
        onClose={() => setIsTicketFormOpen(false)}
        ticket={editingTicket}
        projects={projects}
        defaultColumn={defaultColumns[0]}
      />

      <ColumnConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </div>
  );
};
