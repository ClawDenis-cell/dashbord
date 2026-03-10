import React, { useState, useEffect } from 'react';
import { Ticket, Project } from '../../types';
import { useTicketStore } from '../../store';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
import { Button } from '../common/Button';

interface TicketFormProps {
  isOpen: boolean;
  onClose: () => void;
  ticket?: Ticket | null;
  projects: Project[];
  defaultColumn: string;
}

export const TicketForm: React.FC<TicketFormProps> = ({
  isOpen,
  onClose,
  ticket,
  projects,
  defaultColumn,
}) => {
  const { createTicket, updateTicket } = useTicketStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [columnName, setColumnName] = useState(defaultColumn);

  useEffect(() => {
    if (ticket) {
      setTitle(ticket.title);
      setDescription(ticket.description || '');
      setProjectId(ticket.project_id || '');
      setPriority(ticket.priority);
      setColumnName(ticket.column_name);
    } else {
      setTitle('');
      setDescription('');
      setProjectId('');
      setPriority('medium');
      setColumnName(defaultColumn);
    }
  }, [ticket, defaultColumn, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title,
      description,
      project_id: projectId || undefined,
      priority,
      column_name: columnName,
    };

    if (ticket) {
      await updateTicket(ticket.id, data);
    } else {
      await createTicket(data);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={ticket ? 'Edit Ticket' : 'Create Ticket'}>
      <form onSubmit={handleSubmit}>
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <TextArea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Column</label>
          <input
            type="text"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{ticket ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  );
};
