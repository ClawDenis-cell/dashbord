import { create } from 'zustand';
import { Todo, CreateTodoInput, UpdateTodoInput } from '../types';
import { todoApi } from '../api';

interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  fetchTodos: () => Promise<void>;
  createTodo: (data: CreateTodoInput) => Promise<void>;
  updateTodo: (id: string, data: UpdateTodoInput) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string, completed: boolean) => Promise<void>;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  loading: false,
  error: null,

  fetchTodos: async () => {
    set({ loading: true, error: null });
    try {
      const todos = await todoApi.getAll();
      set({ todos, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch todos', loading: false });
    }
  },

  createTodo: async (data) => {
    set({ loading: true, error: null });
    try {
      const todo = await todoApi.create(data);
      set({ todos: [...get().todos, todo], loading: false });
    } catch (err) {
      set({ error: 'Failed to create todo', loading: false });
    }
  },

  updateTodo: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await todoApi.update(id, data);
      set({
        todos: get().todos.map(t => t.id === id ? updated : t),
        loading: false
      });
    } catch (err) {
      set({ error: 'Failed to update todo', loading: false });
    }
  },

  deleteTodo: async (id) => {
    set({ loading: true, error: null });
    try {
      await todoApi.delete(id);
      set({
        todos: get().todos.filter(t => t.id !== id),
        loading: false
      });
    } catch (err) {
      set({ error: 'Failed to delete todo', loading: false });
    }
  },

  toggleTodo: async (id, completed) => {
    set({ loading: true, error: null });
    try {
      const updated = await todoApi.update(id, { completed });
      set({
        todos: get().todos.map(t => t.id === id ? updated : t),
        loading: false
      });
    } catch (err) {
      set({ error: 'Failed to toggle todo', loading: false });
    }
  },
}));
