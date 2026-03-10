import apiClient from './client';
import { Project, CreateProjectInput, UpdateProjectInput } from '../types';

export const projectApi = {
  getAll: (): Promise<Project[]> => apiClient.get('/projects').then(res => res.data),
  getById: (id: string): Promise<Project> => apiClient.get(`/projects/${id}`).then(res => res.data),
  create: (data: CreateProjectInput): Promise<Project> => apiClient.post('/projects', data).then(res => res.data),
  update: (id: string, data: UpdateProjectInput): Promise<Project> => apiClient.put(`/projects/${id}`, data).then(res => res.data),
  delete: (id: string): Promise<void> => apiClient.delete(`/projects/${id}`),
};
