import apiClient from './client';

export interface Document {
  id: string;
  title: string;
  content: string;
  owner_id: string;
  project_id: string | null;
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

export const documentsApi = {
  getAll: () => apiClient.get<Document[]>('/documents'),
  getRecent: (limit = 5) => apiClient.get<Document[]>(`/documents/recent?limit=${limit}`),
  getById: (id: string) => apiClient.get<Document>(`/documents/${id}`),
  getByProject: (projectId: string) => apiClient.get<Document[]>(`/documents/project/${projectId}`),
  create: (data: { title: string; content?: string; project_id?: string }) => apiClient.post<Document>('/documents', data),
  update: (id: string, data: { title?: string; content?: string; project_id?: string | null }) => apiClient.put<Document>(`/documents/${id}`, data),
  delete: (id: string) => apiClient.delete(`/documents/${id}`),

  // Collaborators
  getCollaborators: (id: string) => apiClient.get<DocumentCollaborator[]>(`/documents/${id}/collaborators`),
  addCollaborator: (id: string, data: { user_id: string; permission: 'read' | 'edit' }) => apiClient.post(`/documents/${id}/collaborators`, data),
  removeCollaborator: (id: string, userId: string) => apiClient.delete(`/documents/${id}/collaborators/${userId}`),

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

  // Export
  exportPdf: (id: string) => apiClient.get(`/documents/${id}/export/pdf`, { responseType: 'blob' }),
};
