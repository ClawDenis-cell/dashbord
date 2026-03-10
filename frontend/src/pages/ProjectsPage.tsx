import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useProjectStore } from '../store';
import { ProjectCard, ProjectForm } from '../components/projects/ProjectCard';
import { Button } from '../components/common/Button';
import { Project } from '../types';

export const ProjectsPage = () => {
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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Projects</h2>
        <Button onClick={handleCreate}>Create Project</Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ProjectCard
              project={project}
              onEdit={handleEdit}
              onDelete={deleteProject}
            />
          </motion.div>
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
