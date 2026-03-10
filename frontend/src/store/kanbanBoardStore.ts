import { create } from 'zustand';
import { KanbanBoard, CreateKanbanBoardInput, UpdateKanbanBoardInput } from '../types';
import { kanbanBoardApi } from '../api';

interface KanbanBoardState {
  boards: KanbanBoard[];
  currentBoard: KanbanBoard | null;
  loading: boolean;
  error: string | null;
  fetchBoards: (projectId: string) => Promise<void>;
  fetchBoard: (id: string) => Promise<void>;
  createBoard: (data: CreateKanbanBoardInput) => Promise<KanbanBoard>;
  updateBoard: (id: string, data: UpdateKanbanBoardInput) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  setCurrentBoard: (board: KanbanBoard | null) => void;
}

export const useKanbanBoardStore = create<KanbanBoardState>((set, get) => ({
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,

  fetchBoards: async (projectId: string) => {
    set({ loading: true, error: null });
    try {
      const boards = await kanbanBoardApi.getByProject(projectId);
      set({ boards, loading: false });
      // Auto-select first board if none selected
      if (boards.length > 0 && !get().currentBoard) {
        set({ currentBoard: boards[0] });
      }
    } catch (err) {
      set({ error: 'Failed to fetch kanban boards', loading: false });
    }
  },

  fetchBoard: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const board = await kanbanBoardApi.getById(id);
      set({ currentBoard: board, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch kanban board', loading: false });
    }
  },

  createBoard: async (data: CreateKanbanBoardInput) => {
    set({ loading: true, error: null });
    try {
      const board = await kanbanBoardApi.create(data);
      set({ 
        boards: [...get().boards, board], 
        currentBoard: board,
        loading: false 
      });
      return board;
    } catch (err) {
      set({ error: 'Failed to create kanban board', loading: false });
      throw err;
    }
  },

  updateBoard: async (id: string, data: UpdateKanbanBoardInput) => {
    set({ loading: true, error: null });
    try {
      const updated = await kanbanBoardApi.update(id, data);
      set({
        boards: get().boards.map(b => b.id === id ? updated : b),
        currentBoard: get().currentBoard?.id === id ? updated : get().currentBoard,
        loading: false
      });
    } catch (err) {
      set({ error: 'Failed to update kanban board', loading: false });
    }
  },

  deleteBoard: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await kanbanBoardApi.delete(id);
      const remainingBoards = get().boards.filter(b => b.id !== id);
      set({
        boards: remainingBoards,
        currentBoard: get().currentBoard?.id === id 
          ? (remainingBoards[0] || null) 
          : get().currentBoard,
        loading: false
      });
    } catch (err) {
      set({ error: 'Failed to delete kanban board', loading: false });
    }
  },

  setCurrentBoard: (board: KanbanBoard | null) => {
    set({ currentBoard: board });
  }
}));