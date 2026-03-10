import React, { useEffect, useState } from 'react';
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Kanban Board</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsConfigOpen(true)}>
            Configure Columns
          </Button>
          <Button onClick={handleCreateTicket}>Add Ticket</Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max">
          {defaultColumns.map((column) => (
            <KanbanColumn
              key={column}
              name={column}
              tickets={getTicketsByColumn(column)}
              onDrop={handleDrop}
              onEditTicket={handleEditTicket}
            />
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
