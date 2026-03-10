import apiClient from './client';
import { KanbanBoard, CreateKanbanBoardInput, UpdateKanbanBoardInput } from '../types';

export const kanbanBoardApi = {
  getByProject: (projectId: string): Promise<KanbanBoard[]> => 
    apiClient.get('/kanban-boards', { params: { projectId } }).then(res => res.data),
  
  getById: (id: string): Promise<KanbanBoard> => 
    apiClient.get(`/kanban-boards/${id}`).then(res => res.data),
  
  create: (data: CreateKanbanBoardInput): Promise<KanbanBoard> => 
    apiClient.post('/kanban-boards', data).then(res => res.data),
  
  update: (id: string, data: UpdateKanbanBoardInput): Promise<KanbanBoard> => 
    apiClient.put(`/kanban-boards/${id}`, data).then(res => res.data),
  
  delete: (id: string): Promise<void> => 
    apiClient.delete(`/kanban-boards/${id}`),
};