import { create } from 'zustand';
import { Project, CreateProjectInput, UpdateProjectInput } from '../types';
import { projectApi } from '../api';

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectInput) => Promise<void>;
  updateProject: (id: string, data: UpdateProjectInput) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await projectApi.getAll();
      set({ projects, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch projects', loading: false });
    }
  },

  createProject: async (data) => {
    set({ loading: true, error: null });
    try {
      const project = await projectApi.create(data);
      set({ projects: [...get().projects, project], loading: false });
    } catch (err) {
      set({ error: 'Failed to create project', loading: false });
    }
  },

  updateProject: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await projectApi.update(id, data);
      set({
        projects: get().projects.map(p => p.id === id ? updated : p),
        loading: false
      });
    } catch (err) {
      set({ error: 'Failed to update project', loading: false });
    }
  },

  deleteProject: async (id) => {
    set({ loading: true, error: null });
    try {
      await projectApi.delete(id);
      set({
        projects: get().projects.filter(p => p.id !== id),
        loading: false
      });
    } catch (err) {
      set({ error: 'Failed to delete project', loading: false });
    }
  },
}));
