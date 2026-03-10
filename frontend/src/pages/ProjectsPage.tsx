import React, { useEffect } from 'react';
import { useProjectStore } from '../../store';
import { ProjectCard, ProjectForm } from '../../components/projects/ProjectCard';
import { Button } from '../../components/common/Button';
import { Project } from '../../types';
import { useState } from 'react';

export const ProjectsPage: React.FC = () => {
  const { projects, fetchProjects, createProject, updateProject, deleteProject } = useProjectStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: { name: string; description: string; color: string }) => {
    if (editingProject) {
      await updateProject(editingProject.id, data);
    } else {
      await createProject(data);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Button onClick={handleCreate}>Create Project</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={handleEdit}
            onDelete={deleteProject}
          />
        ))}
      </div>

      <ProjectForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        project={editingProject}
      />
    </div>
  );
};
