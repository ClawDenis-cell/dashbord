import { create } from 'zustand';
import apiClient from '../api/client';

interface AuthUser {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ token, user, loading: false });
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed.';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  register: async (username: string, email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post('/auth/register', { username, email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ token, user, loading: false });
    } catch (err: any) {
      const message = err.response?.data?.error || 'Registration failed.';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, token: null });
      return;
    }

    set({ loading: true });
    try {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await apiClient.get('/auth/me');
      set({ user: res.data, token, loading: false });
    } catch {
      localStorage.removeItem('token');
      delete apiClient.defaults.headers.common['Authorization'];
      set({ user: null, token: null, loading: false });
    }
  },
}));
