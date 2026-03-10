import apiClient from './client';
import { KanbanConfig, UpdateKanbanConfigInput } from '../types';

export const kanbanConfigApi = {
  getConfig: (userId?: string): Promise<KanbanConfig> => 
    apiClient.get('/kanban-config', { params: { userId } }).then(res => res.data),
  create: (data: { board_name?: string; columns_array: string[]; user_id?: string }): Promise<KanbanConfig> => 
    apiClient.post('/kanban-config', data).then(res => res.data),
  update: (userId: string, data: UpdateKanbanConfigInput): Promise<KanbanConfig> => 
    apiClient.put(`/kanban-config/${userId}`, data).then(res => res.data),
};
