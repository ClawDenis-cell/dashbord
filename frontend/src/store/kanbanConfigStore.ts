import { create } from 'zustand';
import { KanbanConfig } from '../types';
import { kanbanConfigApi } from '../api';

interface KanbanConfigState {
  config: KanbanConfig | null;
  defaultColumns: string[];
  loading: boolean;
  error: string | null;
  fetchConfig: () => Promise<void>;
  updateConfig: (columns: string[], boardName?: string) => Promise<void>;
  setDefaultColumns: (columns: string[]) => void;
}

export const useKanbanConfigStore = create<KanbanConfigState>((set) => ({
  config: null,
  defaultColumns: ['To Do', 'In Progress', 'Done'],
  loading: false,
  error: null,

  fetchConfig: async () => {
    set({ loading: true, error: null });
    try {
      const config = await kanbanConfigApi.getConfig();
      set({ config, defaultColumns: config.columns_array, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch kanban config', loading: false });
    }
  },

  updateConfig: async (columns, boardName) => {
    set({ loading: true, error: null });
    try {
      const config = await kanbanConfigApi.update('default', {
        columns_array: columns,
        board_name: boardName
      });
      set({ config, defaultColumns: columns, loading: false });
    } catch (err) {
      set({ error: 'Failed to update kanban config', loading: false });
    }
  },

  setDefaultColumns: (columns) => {
    set({ defaultColumns: columns });
  }
}));
