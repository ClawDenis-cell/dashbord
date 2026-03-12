"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentModel = void 0;
const database_1 = __importDefault(require("../config/database"));
const crypto_1 = __importDefault(require("crypto"));
exports.DocumentModel = {
    async findAll(userId, folderId) {
        if (folderId !== undefined && folderId !== null) {
            const result = await database_1.default.query(`SELECT DISTINCT d.* FROM documents d
         LEFT JOIN document_collaborators dc ON dc.document_id = d.id AND dc.user_id = $1
         WHERE (d.owner_id = $1 OR dc.user_id = $1) AND d.folder_id = $2
         ORDER BY d.updated_at DESC`, [userId, folderId]);
            return result.rows;
        }
        const result = await database_1.default.query(`SELECT DISTINCT d.* FROM documents d
       LEFT JOIN document_collaborators dc ON dc.document_id = d.id AND dc.user_id = $1
       WHERE d.owner_id = $1 OR dc.user_id = $1
       ORDER BY d.updated_at DESC`, [userId]);
        return result.rows;
    },
    async findById(id) {
        const result = await database_1.default.query('SELECT * FROM documents WHERE id = $1', [id]);
        return result.rows[0] || null;
    },
    async findByProjectId(projectId, userId) {
        const result = await database_1.default.query(`SELECT DISTINCT d.* FROM documents d
       LEFT JOIN document_collaborators dc ON dc.document_id = d.id AND dc.user_id = $2
       WHERE d.project_id = $1 AND (d.owner_id = $2 OR dc.user_id = $2)
       ORDER BY d.updated_at DESC`, [projectId, userId]);
        return result.rows;
    },
    async create(input) {
        const { title, content, owner_id, project_id, folder_id } = input;
        const result = await database_1.default.query('INSERT INTO documents (title, content, owner_id, project_id, folder_id) VALUES ($1, $2, $3, $4, $5) RETURNING *', [title, content || '', owner_id, project_id || null, folder_id || null]);
        return result.rows[0];
    },
    async update(id, input) {
        const fields = [];
        const values = [];
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
        if (input.folder_id !== undefined) {
            fields.push(`folder_id = $${paramIdx++}`);
            values.push(input.folder_id);
        }
        if (fields.length === 0)
            return this.findById(id);
        values.push(id);
        const result = await database_1.default.query(`UPDATE documents SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING *`, values);
        return result.rows[0] || null;
    },
    async delete(id) {
        const result = await database_1.default.query('DELETE FROM documents WHERE id = $1 RETURNING id', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    },
    async canAccess(documentId, userId) {
        const doc = await this.findById(documentId);
        if (!doc)
            return null;
        if (doc.owner_id === userId)
            return 'owner';
        const result = await database_1.default.query('SELECT permission FROM document_collaborators WHERE document_id = $1 AND user_id = $2', [documentId, userId]);
        if (result.rows[0])
            return result.rows[0].permission;
        return null;
    },
    async getCollaborators(documentId) {
        const result = await database_1.default.query(`SELECT dc.*, u.username, u.email FROM document_collaborators dc
       JOIN users u ON u.id = dc.user_id
       WHERE dc.document_id = $1
       ORDER BY dc.joined_at`, [documentId]);
        return result.rows;
    },
    async addCollaborator(documentId, userId, permission) {
        const result = await database_1.default.query(`INSERT INTO document_collaborators (document_id, user_id, permission)
       VALUES ($1, $2, $3)
       ON CONFLICT (document_id, user_id) DO UPDATE SET permission = $3
       RETURNING *`, [documentId, userId, permission]);
        return result.rows[0];
    },
    async removeCollaborator(documentId, userId) {
        const result = await database_1.default.query('DELETE FROM document_collaborators WHERE document_id = $1 AND user_id = $2 RETURNING id', [documentId, userId]);
        return result.rowCount !== null && result.rowCount > 0;
    },
    async createInvite(documentId, permission, expiresInHours = 72) {
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
        const result = await database_1.default.query('INSERT INTO document_invites (document_id, token, permission, expires_at) VALUES ($1, $2, $3, $4) RETURNING *', [documentId, token, permission, expiresAt]);
        return result.rows[0];
    },
    async findInviteByToken(token) {
        const result = await database_1.default.query('SELECT * FROM document_invites WHERE token = $1 AND expires_at > NOW()', [token]);
        return result.rows[0] || null;
    },
    async deleteInvite(id) {
        const result = await database_1.default.query('DELETE FROM document_invites WHERE id = $1 RETURNING id', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    },
    async saveImage(input) {
        const result = await database_1.default.query('INSERT INTO document_images (document_id, filename, original_name, mime_type, size_bytes, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [input.document_id, input.filename, input.original_name, input.mime_type, input.size_bytes, input.uploaded_by]);
        return result.rows[0];
    },
    async getImages(documentId) {
        const result = await database_1.default.query('SELECT * FROM document_images WHERE document_id = $1 ORDER BY created_at DESC', [documentId]);
        return result.rows;
    },
    async getRecentForUser(userId, limit = 5) {
        const result = await database_1.default.query(`SELECT DISTINCT d.* FROM documents d
       LEFT JOIN document_collaborators dc ON dc.document_id = d.id AND dc.user_id = $1
       WHERE d.owner_id = $1 OR dc.user_id = $1
       ORDER BY d.updated_at DESC
       LIMIT $2`, [userId, limit]);
        return result.rows;
    },
    // Folder operations
    async getFolders(userId) {
        const result = await database_1.default.query('SELECT * FROM document_folders WHERE user_id = $1 ORDER BY name', [userId]);
        return result.rows;
    },
    async createFolder(name, userId, parentId = null) {
        const result = await database_1.default.query('INSERT INTO document_folders (name, user_id, parent_id) VALUES ($1, $2, $3) RETURNING *', [name, userId, parentId]);
        return result.rows[0];
    },
    async updateFolder(id, data) {
        const fields = [];
        const values = [];
        let paramIdx = 1;
        if (data.name !== undefined) {
            fields.push(`name = $${paramIdx++}`);
            values.push(data.name);
        }
        if (data.parent_id !== undefined) {
            fields.push(`parent_id = $${paramIdx++}`);
            values.push(data.parent_id);
        }
        if (fields.length === 0)
            return null;
        values.push(id);
        const result = await database_1.default.query(`UPDATE document_folders SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING *`, values);
        return result.rows[0] || null;
    },
    async deleteFolder(id) {
        // Move documents from this folder to root (null)
        await database_1.default.query('UPDATE documents SET folder_id = NULL WHERE folder_id = $1', [id]);
        const result = await database_1.default.query('DELETE FROM document_folders WHERE id = $1 RETURNING id', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    },
    async getFolderById(id) {
        const result = await database_1.default.query('SELECT * FROM document_folders WHERE id = $1', [id]);
        return result.rows[0] || null;
    },
};
//# sourceMappingURL=documents.js.map