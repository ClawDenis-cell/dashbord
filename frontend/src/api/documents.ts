import apiClient from './client';

export interface Document {
  id: string;
  title: string;
  content: string;
  owner_id: string;
  project_id: string | null;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
  collaborators?: DocumentCollaborator[];
  access?: 'owner' | 'edit' | 'read';
}

export interface DocumentCollaborator {
  id: string;
  document_id: string;
  user_id: string;
  permission: 'read' | 'edit';
  joined_at: string;
  username: string;
  email: string;
}

export interface DocumentInvite {
  id: string;
  document_id: string;
  token: string;
  permission: 'read' | 'edit';
  expires_at: string;
  created_at: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  parent_id: string | null;
  user_id: string;
  created_at: string;
}

export const documentsApi = {
  getAll: (folderId?: string | null) => {
    const params = folderId !== undefined && folderId !== null ? `?folder_id=${folderId}` : '';
    return apiClient.get<Document[]>(`/documents${params}`);
  },
  getRecent: (limit = 5) => apiClient.get<Document[]>(`/documents/recent?limit=${limit}`),
  getById: (id: string) => apiClient.get<Document>(`/documents/${id}`),
  getByProject: (projectId: string) => apiClient.get<Document[]>(`/documents/project/${projectId}`),
  create: (data: { title: string; content?: string; project_id?: string; folder_id?: string | null }) => apiClient.post<Document>('/documents', data),
  update: (id: string, data: { title?: string; content?: string; project_id?: string | null; folder_id?: string | null }) => apiClient.put<Document>(`/documents/${id}`, data),
  delete: (id: string) => apiClient.delete(`/documents/${id}`),

  // Collaborators
  getCollaborators: (id: string) => apiClient.get<DocumentCollaborator[]>(`/documents/${id}/collaborators`),
  addCollaborator: (id: string, data: { user_id: string; permission: 'read' | 'edit' }) => apiClient.post(`/documents/${id}/collaborators`, data),
  removeCollaborator: (id: string, userId: string) => apiClient.delete(`/documents/${id}/collaborators/${userId}`),

  // User search (for collaborator adding)
  searchUsers: (query: string) => apiClient.get(`/users/search?q=${encodeURIComponent(query)}`),

  // Invites
  createInvite: (id: string, data: { permission: 'read' | 'edit'; expires_in_hours?: number }) => apiClient.post<DocumentInvite>(`/documents/${id}/invites`, data),
  acceptInvite: (token: string) => apiClient.post(`/documents/invites/${token}/accept`),

  // Images
  uploadImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post(`/documents/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Image from URL (proxy download)
  uploadImageUrl: (id: string, url: string) => apiClient.post(`/documents/${id}/images/url`, { url }),

  // Export
  exportHtml: (id: string) => apiClient.get(`/documents/${id}/export/html`, { responseType: 'blob' }),
  exportPdf: (id: string) => apiClient.get(`/documents/${id}/export/pdf`, { responseType: 'blob' }),

  // Folders
  getFolders: () => apiClient.get<DocumentFolder[]>('/documents/folders'),
  createFolder: (data: { name: string; parent_id?: string | null }) => apiClient.post<DocumentFolder>('/documents/folders', data),
  updateFolder: (id: string, data: { name?: string; parent_id?: string | null }) => apiClient.put<DocumentFolder>(`/documents/folders/${id}`, data),
  deleteFolder: (id: string) => apiClient.delete(`/documents/folders/${id}`),
  moveDocument: (documentId: string, folderId: string | null) => apiClient.put(`/documents/${documentId}`, { folder_id: folderId }),
};
