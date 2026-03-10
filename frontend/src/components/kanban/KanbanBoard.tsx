import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTicketStore, useKanbanBoardStore, useProjectStore } from '../../store';
import { Ticket } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { Button } from '../common/Button';
import { TicketForm } from './TicketForm';
import { BoardSelector } from './BoardSelector';
import { BoardConfigModal } from './BoardConfigModal';

interface KanbanBoardProps {
  projectId?: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId: propProjectId }) => {
  const { projects, fetchProjects } = useProjectStore();
  const { 
    boards, 
    currentBoard, 
    fetchBoards, 
    createBoard, 
    updateBoard, 
    deleteBoard, 
    setCurrentBoard 
  } = useKanbanBoardStore();
  const { tickets, fetchTicketsByBoard, moveTicket } = useTicketStore();
  
  const [isTicketFormOpen, setIsTicketFormOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(propProjectId || null);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Fetch boards when project is selected
  useEffect(() => {
    if (selectedProjectId) {
      fetchBoards(selectedProjectId);
    }
  }, [selectedProjectId, fetchBoards]);

  // Fetch tickets when current board changes
  useEffect(() => {
    if (currentBoard) {
      fetchTicketsByBoard(currentBoard.id);
    }
  }, [currentBoard, fetchTicketsByBoard]);

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

  const handleCreateBoard = async (name: string, columns: string[]) => {
    if (selectedProjectId) {
      await createBoard({ name, project_id: selectedProjectId, columns_array: columns });
    }
  };

  const handleUpdateBoard = async (boardId: string, name: string, columns: string[]) => {
    await updateBoard(boardId, { name, columns_array: columns });
  };

  const handleDeleteBoard = async (boardId: string) => {
    await deleteBoard(boardId);
  };

  const getTicketsByColumn = (columnName: string) => {
    return tickets.filter((ticket) => ticket.column_name === columnName);
  };

  // If no project is selected and we're not in a project context, show project selector
  if (!selectedProjectId && !propProjectId) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Select a Project
          </h2>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Choose a project to view its Kanban boards
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className="p-6 rounded-xl text-left transition-transform hover:scale-105"
                style={{ backgroundColor: project.color + '20', border: `2px solid ${project.color}` }}
              >
                <h3 className="text-lg font-semibold mb-2" style={{ color: project.color }}>
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {project.description}
                  </p>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const currentProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {currentProject?.name || 'Kanban Board'}
          </h2>
          {selectedProjectId && (
            <BoardSelector
              boards={boards}
              currentBoard={currentBoard}
              onSelectBoard={setCurrentBoard}
              onCreateBoard={handleCreateBoard}
              onDeleteBoard={handleDeleteBoard}
              projectId={selectedProjectId}
            />
          )}
        </div>
        
        <div className="flex gap-2">
          {currentBoard && (
            <Button variant="secondary" onClick={() => setIsConfigOpen(true)}>
              Configure
            </Button>
          )}
          <Button onClick={handleCreateTicket} disabled={!currentBoard}>
            Add Ticket
          </Button>
        </div>
      </motion.div>

      {!currentBoard ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              No boards yet. Create your first board!
            </p>
            <Button onClick={() => handleCreateBoard('Default Board', ['To Do', 'In Progress', 'Done'])}>
              Create Default Board
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 h-full min-w-max">
            {currentBoard.columns_array.map((column, index) => (
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
      )}

      <TicketForm
        isOpen={isTicketFormOpen}
        onClose={() => setIsTicketFormOpen(false)}
        ticket={editingTicket}
        projects={projects}
        defaultColumn={currentBoard?.columns_array[0] || 'To Do'}
        defaultProjectId={selectedProjectId || undefined}
        defaultBoardId={currentBoard?.id}
      />

      <BoardConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        board={currentBoard}
        onSave={handleUpdateBoard}
      />
    </div>
  );
};