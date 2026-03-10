import apiClient from './client';
import { Ticket, CreateTicketInput, UpdateTicketInput } from '../types';

export const ticketApi = {
  getAll: (): Promise<Ticket[]> => apiClient.get('/tickets').then(res => res.data),
  getById: (id: string): Promise<Ticket> => apiClient.get(`/tickets/${id}`).then(res => res.data),
  create: (data: CreateTicketInput): Promise<Ticket> => apiClient.post('/tickets', data).then(res => res.data),
  update: (id: string, data: UpdateTicketInput): Promise<Ticket> => apiClient.put(`/tickets/${id}`, data).then(res => res.data),
  delete: (id: string): Promise<void> => apiClient.delete(`/tickets/${id}`),
};
