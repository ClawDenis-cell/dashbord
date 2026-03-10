import pool from '../config/database';
import crypto from 'crypto';

export interface Document {
  id: string;
  title: string;
  content: string;
  owner_id: string;
  project_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface DocumentCollaborator {
  id: string;
  document_id: string;
  user_id: string;
  permission: 'read' | 'edit';
  joined_at: Date;
}

export interface DocumentInvite {
  id: string;
  document_id: string;
  token: string;
  permission: 'read' | 'edit';
  expires_at: Date;
  created_at: Date;
}

export interface DocumentImage {
  id: string;
  document_id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  uploaded_by: string;
  created_at: Date;
}

export interface CreateDocumentInput {
  title: string;
  content?: string;
  owner_id: string;
  project_id?: string;
}

export interface UpdateDocumentInput {
  title?: string;
  content?: string;
  project_id?: string | null;
}

export const DocumentModel = {
  async findAll(userId: string): Promise<Document[]> {
    const result = await pool.query(
      `SELECT DISTINCT d.* FROM documents d
       LEFT JOIN document_collaborators dc ON dc.document_id = d.id AND dc.user_id = $1
       WHERE d.owner_id = $1 OR dc.user_id = $1
       ORDER BY d.updated_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async findById(id: string): Promise<Document | null> {
    const result = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findByProjectId(projectId: string, userId: string): Promise<Document[]> {
    const result = await pool.query(
      `SELECT DISTINCT d.* FROM documents d
       LEFT JOIN document_collaborators dc ON dc.document_id = d.id AND dc.user_id = $2
       WHERE d.project_id = $1 AND (d.owner_id = $2 OR dc.user_id = $2)
       ORDER BY d.updated_at DESC`,
      [projectId, userId]
    );
    return result.rows;
  },

  async create(input: CreateDocumentInput): Promise<Document> {
    const { title, content, owner_id, project_id } = input;
    const result = await pool.query(
      'INSERT INTO documents (title, content, owner_id, project_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content || '', owner_id, project_id || null]
    );
    return result.rows[0];
  },

  async update(id: string, input: UpdateDocumentInput): Promise<Document | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    if (input.title !== undefined) {
      fields.push(`title = $${paramIdx++}`);
      values.push(input.title);
    }
    if (input.content !== undefined) {
      fields.push(`content = $${paramIdx++}`);
      values.push(input.content);
    }
    if (input.project_id !== undefined) {
      fields.push(`project_id = $${paramIdx++}`);
      values.push(input.project_id);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await pool.query(
      `UPDATE documents SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM documents WHERE id = $1 RETURNING id', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  },

  async canAccess(documentId: string, userId: string): Promise<'owner' | 'edit' | 'read' | null> {
    const doc = await this.findById(documentId);
    if (!doc) return null;
    if (doc.owner_id === userId) return 'owner';

    const result = await pool.query(
      'SELECT permission FROM document_collaborators WHERE document_id = $1 AND user_id = $2',
      [documentId, userId]
    );
    if (result.rows[0]) return result.rows[0].permission;
    return null;
  },

  async getCollaborators(documentId: string): Promise<(DocumentCollaborator & { username: string; email: string })[]> {
    const result = await pool.query(
      `SELECT dc.*, u.username, u.email FROM document_collaborators dc
       JOIN users u ON u.id = dc.user_id
       WHERE dc.document_id = $1
       ORDER BY dc.joined_at`,
      [documentId]
    );
    return result.rows;
  },

  async addCollaborator(documentId: string, userId: string, permission: 'read' | 'edit'): Promise<DocumentCollaborator> {
    const result = await pool.query(
      `INSERT INTO document_collaborators (document_id, user_id, permission)
       VALUES ($1, $2, $3)
       ON CONFLICT (document_id, user_id) DO UPDATE SET permission = $3
       RETURNING *`,
      [documentId, userId, permission]
    );
    return result.rows[0];
  },

  async removeCollaborator(documentId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM document_collaborators WHERE document_id = $1 AND user_id = $2 RETURNING id',
      [documentId, userId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  },

  async createInvite(documentId: string, permission: 'read' | 'edit', expiresInHours: number = 72): Promise<DocumentInvite> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    const result = await pool.query(
      'INSERT INTO document_invites (document_id, token, permission, expires_at) VALUES ($1, $2, $3, $4) RETURNING *',
      [documentId, token, permission, expiresAt]
    );
    return result.rows[0];
  },

  async findInviteByToken(token: string): Promise<DocumentInvite | null> {
    const result = await pool.query(
      'SELECT * FROM document_invites WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    return result.rows[0] || null;
  },

  async deleteInvite(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM document_invites WHERE id = $1 RETURNING id', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  },

  async saveImage(input: { document_id: string; filename: string; original_name: string; mime_type: string; size_bytes: number; uploaded_by: string }): Promise<DocumentImage> {
    const result = await pool.query(
      'INSERT INTO document_images (document_id, filename, original_name, mime_type, size_bytes, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [input.document_id, input.filename, input.original_name, input.mime_type, input.size_bytes, input.uploaded_by]
    );
    return result.rows[0];
  },

  async getImages(documentId: string): Promise<DocumentImage[]> {
    const result = await pool.query(
      'SELECT * FROM document_images WHERE document_id = $1 ORDER BY created_at DESC',
      [documentId]
    );
    return result.rows;
  },

  async getRecentForUser(userId: string, limit: number = 5): Promise<Document[]> {
    const result = await pool.query(
      `SELECT DISTINCT d.* FROM documents d
       LEFT JOIN document_collaborators dc ON dc.document_id = d.id AND dc.user_id = $1
       WHERE d.owner_id = $1 OR dc.user_id = $1
       ORDER BY d.updated_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },
};
