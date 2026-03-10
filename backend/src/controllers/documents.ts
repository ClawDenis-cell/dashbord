import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { DocumentModel } from '../models/documents';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads';

export const DocumentController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const docs = await DocumentModel.findAll(req.userId);
      res.json(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents.' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const { id } = req.params;

      const access = await DocumentModel.canAccess(id, req.userId);
      if (!access) return res.status(404).json({ error: 'Document not found.' });

      const doc = await DocumentModel.findById(id);
      const collaborators = await DocumentModel.getCollaborators(id);

      res.json({ ...doc, collaborators, access });
    } catch (error) {
      console.error('Error fetching document:', error);
      res.status(500).json({ error: 'Failed to fetch document.' });
    }
  },

  async getByProject(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const { projectId } = req.params;
      const docs = await DocumentModel.findByProjectId(projectId, req.userId);
      res.json(docs);
    } catch (error) {
      console.error('Error fetching project documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents.' });
    }
  },

  async getRecent(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const limit = parseInt(req.query.limit as string) || 5;
      const docs = await DocumentModel.getRecentForUser(req.userId, limit);
      res.json(docs);
    } catch (error) {
      console.error('Error fetching recent documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents.' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const { title, content, project_id } = req.body;

      if (!title) return res.status(400).json({ error: 'Title is required.' });

      const doc = await DocumentModel.create({
        title,
        content: content || '',
        owner_id: req.userId,
        project_id,
      });
      res.status(201).json(doc);
    } catch (error) {
      console.error('Error creating document:', error);
      res.status(500).json({ error: 'Failed to create document.' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const { id } = req.params;

      const access = await DocumentModel.canAccess(id, req.userId);
      if (!access) return res.status(404).json({ error: 'Document not found.' });
      if (access === 'read') return res.status(403).json({ error: 'Read-only access.' });

      const doc = await DocumentModel.update(id, req.body);
      res.json(doc);
    } catch (error) {
      console.error('Error updating document:', error);
      res.status(500).json({ error: 'Failed to update document.' });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const { id } = req.params;

      const access = await DocumentModel.canAccess(id, req.userId);
      if (access !== 'owner') return res.status(403).json({ error: 'Only the owner can delete a document.' });

      await DocumentModel.delete(id);
      res.json({ message: 'Document deleted.' });
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ error: 'Failed to delete document.' });
    }
  },

  async getCollaborators(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const { id } = req.params;

      const access = await DocumentModel.canAccess(id, req.userId);
      if (!access) return res.status(404).json({ error: 'Document not found.' });

      const collaborators = await DocumentModel.getCollaborators(id);
      res.json(collaborators);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      res.status(500).json({ error: 'Failed to fetch collaborators.' });
    }
  },

  async addCollaborator(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const { id } = req.params;
      const { user_id, permission } = req.body;

      const access = await DocumentModel.canAccess(id, req.userId);
      if (access !== 'owner') return res.status(403).json({ error: 'Only the owner can manage collaborators.' });

      if (!user_id || !permission) {
        return res.status(400).json({ error: 'user_id and permission are required.' });
      }

      const collab = await DocumentModel.addCollaborator(id, user_id, permission);
      res.status(201).json(collab);
    } catch (error) {
      console.error('Error adding collaborator:', error);
      res.status(500).json({ error: 'Failed to add collaborator.' });
    }
  },

  async removeCollaborator(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const { id, userId } = req.params;

      const access = await DocumentModel.canAccess(id, req.userId);
      if (access !== 'owner') return res.status(403).json({ error: 'Only the owner can manage collaborators.' });

      await DocumentModel.removeCollaborator(id, userId);
      res.json({ message: 'Collaborator removed.' });
    } catch (error) {
      console.error('Error removing collaborator:', error);
      res.status(500).json({ error: 'Failed to remove collaborator.' });
    }
  },

  async createInvite(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const { id } = req.params;
      const { permission, expires_in_hours } = req.body;

      const access = await DocumentModel.canAccess(id, req.userId);
      if (access !== 'owner') return res.status(403).json({ error: 'Only the owner can create invites.' });

      const invite = await DocumentModel.createInvite(id, permission || 'read', expires_in_hours || 72);
      res.status(201).json(invite);
    } catch (error) {
      console.error('Error creating invite:', error);
      res.status(500).json({ error: 'Failed to create invite.' });
    }
  },

  async acceptInvite(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const { token } = req.params;

      const invite = await DocumentModel.findInviteByToken(token);
      if (!invite) return res.status(404).json({ error: 'Invite not found or expired.' });

      const doc = await DocumentModel.findById(invite.document_id);
      if (!doc) return res.status(404).json({ error: 'Document not found.' });

      if (doc.owner_id === req.userId) {
        return res.json({ message: 'You are the owner of this document.', document: doc });
      }

      await DocumentModel.addCollaborator(invite.document_id, req.userId, invite.permission);
      res.json({ message: 'Invite accepted.', document: doc });
    } catch (error) {
      console.error('Error accepting invite:', error);
      res.status(500).json({ error: 'Failed to accept invite.' });
    }
  },

  async uploadImage(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const { id } = req.params;

      const access = await DocumentModel.canAccess(id, req.userId);
      if (!access || access === 'read') return res.status(403).json({ error: 'No write access.' });

      if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

      const ext = path.extname(req.file.originalname);
      const filename = `${crypto.randomBytes(16).toString('hex')}${ext}`;
      const uploadPath = path.join(UPLOAD_DIR, 'documents', id);

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      fs.writeFileSync(path.join(uploadPath, filename), req.file.buffer);

      const image = await DocumentModel.saveImage({
        document_id: id,
        filename,
        original_name: req.file.originalname,
        mime_type: req.file.mimetype,
        size_bytes: req.file.size,
        uploaded_by: req.userId,
      });

      res.status(201).json({
        ...image,
        url: `/uploads/documents/${id}/${filename}`,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Failed to upload image.' });
    }
  },

  async exportPdf(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const { id } = req.params;

      const access = await DocumentModel.canAccess(id, req.userId);
      if (!access) return res.status(404).json({ error: 'Document not found.' });

      const doc = await DocumentModel.findById(id);
      if (!doc) return res.status(404).json({ error: 'Document not found.' });

      // Simple HTML-based PDF export using a basic HTML template
      // In production, use Puppeteer or a dedicated PDF service
      const htmlContent = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${doc.title}</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; }
h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
pre { background: #f5f5f5; padding: 16px; border-radius: 4px; overflow-x: auto; }
code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
blockquote { border-left: 4px solid #ddd; margin-left: 0; padding-left: 16px; color: #666; }
</style></head><body>
<h1>${doc.title}</h1>
<div>${doc.content}</div>
<hr><p style="color:#999;font-size:12px;">Exported on ${new Date().toISOString()}</p>
</body></html>`;

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.html"`);
      res.send(htmlContent);
    } catch (error) {
      console.error('Error exporting document:', error);
      res.status(500).json({ error: 'Failed to export document.' });
    }
  },
};
