import React, { useState } from 'react';
import { Project } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow border-l-4" style={{ borderLeftColor: project.color }}>
      <h3 className="font-semibold text-lg">{project.name}</h3>
      <p className="text-gray-600 text-sm mt-1">{project.description}</p>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => onEdit(project)}>
          Edit
        </Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(project.id)}>
          Delete
        </Button>
      </div>
    </div>
  );
};

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; color: string }) => void;
  project?: Project | null;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ isOpen, onClose, onSubmit, project }) => {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [color, setColor] = useState(project?.color || '#3B82F6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, color });
    if (!project) {
      setName('');
      setDescription('');
      setColor('#3B82F6');
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project ? 'Edit Project' : 'Create Project'}>
      <form onSubmit={handleSubmit}>
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextArea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {project ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
