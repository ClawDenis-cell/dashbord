import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="glass-card p-5 transition-shadow duration-200"
      style={{
        borderLeft: `4px solid ${project.color}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
        {project.name}
      </h3>
      <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
        {project.description}
      </p>
      <div className="mt-4 flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => onEdit(project)}>
          Edit
        </Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(project.id)}>
          Delete
        </Button>
      </div>
    </motion.div>
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
  const [color, setColor] = useState(project?.color || '#8b5cf6');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setColor(project.color || '#8b5cf6');
    } else {
      setName('');
      setDescription('');
      setColor('#8b5cf6');
    }
  }, [project, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, color });
    if (!project) {
      setName('');
      setDescription('');
      setColor('#8b5cf6');
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
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-none"
            />
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{color}</span>
          </div>
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
