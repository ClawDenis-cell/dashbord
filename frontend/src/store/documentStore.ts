import { create } from 'zustand';
import { documentsApi, Document } from '../api/documents';

interface DocumentState {
  documents: Document[];
  recentDocuments: Document[];
  currentDocument: Document | null;
  loading: boolean;
  error: string | null;
  fetchDocuments: () => Promise<void>;
  fetchRecentDocuments: (limit?: number) => Promise<void>;
  fetchDocument: (id: string) => Promise<void>;
  createDocument: (data: { title: string; content?: string; project_id?: string }) => Promise<Document>;
  updateDocument: (id: string, data: { title?: string; content?: string; project_id?: string | null }) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  setCurrentDocument: (doc: Document | null) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  recentDocuments: [],
  currentDocument: null,
  loading: false,
  error: null,

  fetchDocuments: async () => {
    set({ loading: true, error: null });
    try {
      const res = await documentsApi.getAll();
      set({ documents: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to load documents', loading: false });
    }
  },

  fetchRecentDocuments: async (limit = 5) => {
    try {
      const res = await documentsApi.getRecent(limit);
      set({ recentDocuments: res.data });
    } catch {
      // Silently fail for recent docs widget
    }
  },

  fetchDocument: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await documentsApi.getById(id);
      set({ currentDocument: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to load document', loading: false });
    }
  },

  createDocument: async (data) => {
    set({ error: null });
    try {
      const res = await documentsApi.create(data);
      set((state) => ({ documents: [res.data, ...state.documents] }));
      return res.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to create document';
      set({ error: message });
      throw new Error(message);
    }
  },

  updateDocument: async (id, data) => {
    set({ error: null });
    try {
      const res = await documentsApi.update(id, data);
      set((state) => ({
        documents: state.documents.map((d) => (d.id === id ? res.data : d)),
        currentDocument: state.currentDocument?.id === id ? res.data : state.currentDocument,
      }));
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to update document';
      set({ error: message });
      throw new Error(message);
    }
  },

  deleteDocument: async (id) => {
    set({ error: null });
    try {
      await documentsApi.delete(id);
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
        currentDocument: state.currentDocument?.id === id ? null : state.currentDocument,
      }));
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to delete document';
      set({ error: message });
      throw new Error(message);
    }
  },

  setCurrentDocument: (doc) => set({ currentDocument: doc }),
}));
