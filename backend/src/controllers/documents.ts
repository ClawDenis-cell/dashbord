import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { DocumentModel } from '../models/documents';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import https from 'https';
import http from 'http';
import puppeteer from 'puppeteer';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads';

// Simple markdown to HTML converter for export
function markdownToHtml(md: string): string {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="lang-$1">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- \[x\] (.+)$/gm, '<li class="task done"><input type="checkbox" checked disabled /> $1</li>')
    .replace(/^- \[ \] (.+)$/gm, '<li class="task"><input type="checkbox" disabled /> $1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^---$/gm, '<hr />')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />');
}

function buildHtmlDocument(title: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.7; color: #1a1a1a; }
h1 { font-size: 2em; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-top: 1.5em; }
h2 { font-size: 1.5em; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-top: 1.3em; }
h3 { font-size: 1.2em; margin-top: 1.2em; }
pre { background: #f3f4f6; padding: 16px; border-radius: 6px; overflow-x: auto; font-size: 14px; line-height: 1.5; }
code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
pre code { background: none; padding: 0; }
blockquote { border-left: 4px solid #d1d5db; margin: 1em 0; padding: 0.5em 1em; color: #6b7280; background: #f9fafb; border-radius: 0 6px 6px 0; }
a { color: #2563eb; text-decoration: none; }
a:hover { text-decoration: underline; }
img { max-width: 100%; border-radius: 8px; margin: 1em 0; }
hr { border: none; border-top: 1px solid #e5e7eb; margin: 2em 0; }
li { margin: 0.3em 0; }
del { color: #9ca3af; }
.task { list-style: none; margin-left: -1.2em; }
.task input { margin-right: 0.5em; }
@media print {
  body { padding: 0; max-width: none; }
  pre { white-space: pre-wrap; }
}
</style></head><body>
<h1>${title}</h1>
<div><p>${contentHtml}</p></div>
<hr><p style="color:#9ca3af;font-size:12px;">Exported on ${new Date().toLocaleString()}</p>
</body></html>`;
}

export const DocumentController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const folderId = req.query.folder_id as string | undefined;
      const docs = await DocumentModel.findAll(req.userId, folderId || undefined);
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
      const { title, content, project_id, folder_id } = req.body;

      if (!title) return res.status(400).json({ error: 'Title is required.' });

      const doc = await DocumentModel.create({
        title,
        content: content || '',
        owner_id: req.userId,
        project_id,
        folder_id,
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

  // Proxy download image from URL
  async uploadImageUrl(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const { id } = req.params;
      const { url } = req.body;

      if (!url) return res.status(400).json({ error: 'URL is required.' });

      const access = await DocumentModel.canAccess(id, req.userId);
      if (!access || access === 'read') return res.status(403).json({ error: 'No write access.' });

      // Download the image
      const imageBuffer = await new Promise<Buffer>((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, { timeout: 10000 }, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`HTTP ${response.statusCode}`));
            return;
          }
          const chunks: Buffer[] = [];
          response.on('data', (chunk: Buffer) => chunks.push(chunk));
          response.on('end', () => resolve(Buffer.concat(chunks)));
          response.on('error', reject);
        }).on('error', reject);
      });

      // Determine extension from URL or content type
      const urlPath = new URL(url).pathname;
      let ext = path.extname(urlPath) || '.png';
      if (!['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext.toLowerCase())) {
        ext = '.png';
      }

      const filename = `${crypto.randomBytes(16).toString('hex')}${ext}`;
      const uploadPath = path.join(UPLOAD_DIR, 'documents', id);

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      fs.writeFileSync(path.join(uploadPath, filename), imageBuffer);

      const mimeTypes: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
      };

      const image = await DocumentModel.saveImage({
        document_id: id,
        filename,
        original_name: path.basename(urlPath) || `image${ext}`,
        mime_type: mimeTypes[ext.toLowerCase()] || 'image/png',
        size_bytes: imageBuffer.length,
        uploaded_by: req.userId,
      });

      res.status(201).json({
        ...image,
        url: `/uploads/documents/${id}/${filename}`,
      });
    } catch (error) {
      console.error('Error downloading image from URL:', error);
      res.status(500).json({ error: 'Failed to download image from URL.' });
    }
  },

  // HTML Export
  async exportHtml(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const { id } = req.params;

      const access = await DocumentModel.canAccess(id, req.userId);
      if (!access) return res.status(404).json({ error: 'Document not found.' });

      const doc = await DocumentModel.findById(id);
      if (!doc) return res.status(404).json({ error: 'Document not found.' });

      const contentHtml = markdownToHtml(doc.content);
      const htmlContent = buildHtmlDocument(doc.title, contentHtml);

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.html"`);
      res.send(htmlContent);
    } catch (error) {
      console.error('Error exporting document:', error);
      res.status(500).json({ error: 'Failed to export document.' });
    }
  },

  // PDF Export (uses HTML + print CSS, or Puppeteer if available)
  async exportPdf(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const { id } = req.params;

      const access = await DocumentModel.canAccess(id, req.userId);
      if (!access) return res.status(404).json({ error: 'Document not found.' });

      const doc = await DocumentModel.findById(id);
      if (!doc) return res.status(404).json({ error: 'Document not found.' });

      const contentHtml = markdownToHtml(doc.content);
      const htmlContent = buildHtmlDocument(doc.title, contentHtml);

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
        printBackground: true,
      });
      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
      res.send(Buffer.from(pdfBuffer));
    } catch (error) {
      console.error('Error exporting PDF:', error);
      res.status(500).json({ error: 'Failed to export PDF.' });
    }
  },

  // Folder operations
  async getFolders(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const folders = await DocumentModel.getFolders(req.userId);
      res.json(folders);
    } catch (error) {
      console.error('Error fetching folders:', error);
      res.status(500).json({ error: 'Failed to fetch folders.' });
    }
  },

  async createFolder(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const { name, parent_id } = req.body;

      if (!name) return res.status(400).json({ error: 'Folder name is required.' });

      const folder = await DocumentModel.createFolder(name, req.userId, parent_id || null);
      res.status(201).json(folder);
    } catch (error) {
      console.error('Error creating folder:', error);
      res.status(500).json({ error: 'Failed to create folder.' });
    }
  },

  async updateFolder(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const { id } = req.params;

      const folder = await DocumentModel.getFolderById(id);
      if (!folder || folder.user_id !== req.userId) {
        return res.status(404).json({ error: 'Folder not found.' });
      }

      const updated = await DocumentModel.updateFolder(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error('Error updating folder:', error);
      res.status(500).json({ error: 'Failed to update folder.' });
    }
  },

  async deleteFolder(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const { id } = req.params;

      const folder = await DocumentModel.getFolderById(id);
      if (!folder || folder.user_id !== req.userId) {
        return res.status(404).json({ error: 'Folder not found.' });
      }

      await DocumentModel.deleteFolder(id);
      res.json({ message: 'Folder deleted.' });
    } catch (error) {
      console.error('Error deleting folder:', error);
      res.status(500).json({ error: 'Failed to delete folder.' });
    }
  },
};
