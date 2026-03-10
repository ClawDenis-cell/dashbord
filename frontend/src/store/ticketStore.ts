import { create } from 'zustand';
import { Ticket, CreateTicketInput, UpdateTicketInput } from '../types';
import { ticketApi } from '../api';

interface TicketState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  fetchTickets: () => Promise<void>;
  createTicket: (data: CreateTicketInput) => Promise<void>;
  updateTicket: (id: string, data: UpdateTicketInput) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  moveTicket: (id: string, columnName: string) => Promise<void>;
}

export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: [],
  loading: false,
  error: null,

  fetchTickets: async () => {
    set({ loading: true, error: null });
    try {
      const tickets = await ticketApi.getAll();
      set({ tickets, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch tickets', loading: false });
    }
  },

  createTicket: async (data) => {
    set({ loading: true, error: null });
    try {
      const ticket = await ticketApi.create(data);
      set({ tickets: [...get().tickets, ticket], loading: false });
    } catch (err) {
      set({ error: 'Failed to create ticket', loading: false });
    }
  },

  updateTicket: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await ticketApi.update(id, data);
      set({
        tickets: get().tickets.map(t => t.id === id ? updated : t),
        loading: false
      });
    } catch (err) {
      set({ error: 'Failed to update ticket', loading: false });
    }
  },

  deleteTicket: async (id) => {
    set({ loading: true, error: null });
    try {
      await ticketApi.delete(id);
      set({
        tickets: get().tickets.filter(t => t.id !== id),
        loading: false
      });
    } catch (err) {
      set({ error: 'Failed to delete ticket', loading: false });
    }
  },

  moveTicket: async (id, columnName) => {
    set({ loading: true, error: null });
    try {
      const updated = await ticketApi.update(id, { column_name: columnName });
      set({
        tickets: get().tickets.map(t => t.id === id ? updated : t),
        loading: false
      });
    } catch (err) {
      set({ error: 'Failed to move ticket', loading: false });
    }
  },
}));
