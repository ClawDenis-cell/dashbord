import apiClient from './client';
import { Todo, CreateTodoInput, UpdateTodoInput } from '../types';

export const todoApi = {
  getAll: (): Promise<Todo[]> => apiClient.get('/todos').then(res => res.data),
  getById: (id: string): Promise<Todo> => apiClient.get(`/todos/${id}`).then(res => res.data),
  create: (data: CreateTodoInput): Promise<Todo> => apiClient.post('/todos', data).then(res => res.data),
  update: (id: string, data: UpdateTodoInput): Promise<Todo> => apiClient.put(`/todos/${id}`, data).then(res => res.data),
  delete: (id: string): Promise<void> => apiClient.delete(`/todos/${id}`),
};
