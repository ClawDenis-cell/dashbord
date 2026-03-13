import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { DocumentModel } from '../models/documents';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import https from 'https';
import http from 'http';


const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads';

// Enhanced markdown to HTML converter for export
function markdownToHtml(md: string): string {
  let html = md
    // Escape HTML entities
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Tables (GitHub Flavored)
    .replace(/\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g, (match, header, rows) => {
      const headers = header.split('|').map((h: string) => h.trim()).filter(Boolean);
      const rowLines = rows.trim().split('\n');
      const dataRows = rowLines.map((line: string) => 
        line.split('|').map((c: string) => c.trim()).filter(Boolean)
      );
      
      let tableHtml = '<table><thead><tr>';
      headers.forEach((h: string) => {
        tableHtml += `<th>${h}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';
      
      dataRows.forEach((row: string[]) => {
        tableHtml += '<tr>';
        row.forEach((cell: string) => {
          tableHtml += `<td>${cell}</td>`;
        });
        tableHtml += '</tr>';
      });
      tableHtml += '</tbody></table>';
      return tableHtml;
    })
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold & Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Code blocks with language
    .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'text';
      return `<pre><code class="language-${language}">${code.trim()}</code></pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Blockquotes
    .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
    // Task lists
    .replace(/^- \[x\] (.+)$/gm, '<li class="task done">$1</li>')
    .replace(/^- \[ \] (.+)$/gm, '<li class="task">$1</li>')
    // Unordered lists
    .replace(/^[-\*] (.+)$/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Images with better handling
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr />')
    .replace(/^\*\*\*$/gm, '<hr />');

  // Wrap lists in ul/ol
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    if (match.includes('class="task"')) {
      return '<ul style="list-style:none;padding-left:0;">' + match + '</ul>';
    }
    return '<ul>' + match + '</ul>';
  });

  // Wrap in paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br />');

  // Fix duplicate paragraphs around block elements
  html = html.replace(/<p>(<h[123]>.*?<\/h[123]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>.*?<\/pre>)<\/p>/gs, '$1');
  html = html.replace(/<p>(<blockquote>.*?<\/blockquote>)<\/p>/gs, '$1');
  html = html.replace(/<p>(<table>.*?<\/table>)<\/p>/gs, '$1');
  html = html.replace(/<p>(<ul>.*?<\/ul>)<\/p>/gs, '$1');
  html = html.replace(/<p>(<hr \/>)<\/p>/g, '$1');

  return html;
}

function buildHtmlDocument(title: string, contentHtml: string): string {
  const exportDate = new Date().toLocaleDateString('de-DE', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const exportTime = new Date().toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 20mm 15mm 25mm 15mm;
    }
    
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11pt;
      line-height: 1.7;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-feature-settings: 'liga' 1, 'kern' 1;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
    
    /* Document header */
    .doc-header {
      margin-bottom: 35px;
      padding-bottom: 20px;
      border-bottom: 2.5px solid #3b82f6;
      page-break-after: avoid;
    }
    
    .doc-header h1 {
      font-size: 26pt;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 10px 0;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }
    
    .doc-header-meta {
      display: flex;
      gap: 20px;
      font-size: 9.5pt;
      color: #64748b;
      font-weight: 400;
    }
    
    .doc-header-meta span {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    /* Content area */
    .content {
      max-width: none;
    }
    
    /* Headings */
    .content h1 {
      font-size: 20pt;
      font-weight: 700;
      color: #0f172a;
      margin: 35px 0 16px 0;
      padding-bottom: 10px;
      border-bottom: 1.5px solid #e2e8f0;
      letter-spacing: -0.01em;
      page-break-after: avoid;
    }
    
    .content h2 {
      font-size: 16pt;
      font-weight: 600;
      color: #1e293b;
      margin: 28px 0 14px 0;
      letter-spacing: -0.01em;
      page-break-after: avoid;
    }
    
    .content h3 {
      font-size: 13pt;
      font-weight: 600;
      color: #334155;
      margin: 22px 0 10px 0;
      page-break-after: avoid;
    }
    
    /* Paragraphs */
    .content p {
      margin: 12px 0;
      orphans: 3;
      widows: 3;
    }
    
    /* Links */
    .content a {
      color: #2563eb;
      text-decoration: none;
      border-bottom: 1px solid #93c5fd;
    }
    
    /* Code blocks */
    .content pre {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 3px solid #3b82f6;
      border-radius: 6px;
      padding: 14px 18px;
      overflow-x: visible;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
      font-size: 9pt;
      line-height: 1.6;
      margin: 18px 0;
      page-break-inside: avoid;
      color: #334155;
    }
    
    .content code {
      font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
      font-size: 9pt;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      color: #334155;
      border: 1px solid #e2e8f0;
    }
    
    .content pre code {
      background: none;
      padding: 0;
      border: none;
      font-size: inherit;
    }
    
    /* Blockquotes */
    .content blockquote {
      border-left: 4px solid #3b82f6;
      margin: 18px 0;
      padding: 14px 22px;
      background: #f0f9ff;
      color: #475569;
      font-style: italic;
      border-radius: 0 6px 6px 0;
      page-break-inside: avoid;
    }
    
    .content blockquote p {
      margin: 6px 0;
    }
    
    /* Images */
    .content img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 18px 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      page-break-inside: avoid;
    }
    
    /* Horizontal rules */
    .content hr {
      border: none;
      border-top: 1.5px solid #e2e8f0;
      margin: 30px 0;
    }
    
    /* Lists */
    .content ul, .content ol {
      margin: 12px 0;
      padding-left: 28px;
    }
    
    .content li {
      margin: 6px 0;
      line-height: 1.6;
    }
    
    .content li > ul, .content li > ol {
      margin: 4px 0;
    }
    
    .content li.task {
      list-style: none;
      margin-left: -28px;
      padding-left: 28px;
      position: relative;
    }
    
    .content li.task::before {
      content: "\\2610";
      position: absolute;
      left: 0;
      color: #94a3b8;
      font-size: 12pt;
    }
    
    .content li.task.done::before {
      content: "\\2611";
      color: #22c55e;
    }
    
    /* Strikethrough */
    .content del {
      color: #94a3b8;
      text-decoration: line-through;
    }
    
    /* Tables */
    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 18px 0;
      font-size: 10pt;
      page-break-inside: avoid;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
    }
    
    .content thead {
      background: #f1f5f9;
    }
    
    .content th {
      border: 1px solid #e2e8f0;
      padding: 10px 14px;
      text-align: left;
      font-weight: 600;
      color: #1e293b;
      font-size: 9.5pt;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    
    .content td {
      border: 1px solid #e2e8f0;
      padding: 9px 14px;
      text-align: left;
      color: #334155;
    }
    
    .content tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    
    /* Strong & emphasis */
    .content strong {
      font-weight: 600;
      color: #0f172a;
    }
    
    .content em {
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="doc-header">
    <h1>${title}</h1>
    <div class="doc-header-meta">
      <span>Exportiert am ${exportDate} um ${exportTime}</span>
    </div>
  </div>
  
  <div class="content">
    ${contentHtml}
  </div>
</body>
</html>`;
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

  // PDF Export using Pandoc
  async exportPdf(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const { id } = req.params;

      const access = await DocumentModel.canAccess(id, req.userId);
      if (!access) return res.status(404).json({ error: 'Document not found.' });

      const doc = await DocumentModel.findById(id);
      if (!doc) return res.status(404).json({ error: 'Document not found.' });

      // Use Pandoc for PDF generation
      const { spawn } = await import('child_process');
      
      const tempDir = '/tmp';
      const inputFile = `${tempDir}/pdf-export-${Date.now()}.md`;
      const outputFile = `${tempDir}/pdf-export-${Date.now()}.pdf`;
      
      // Add YAML metadata header
      const markdownWithMeta = `---
title: "${doc.title}"
author: ""
date: "${new Date().toLocaleDateString('de-DE')}"
---

${doc.content}`;

      // Write temp input file
      const fs = await import('fs/promises');
      await fs.writeFile(inputFile, markdownWithMeta, 'utf-8');

      // Run pandoc command
      const pandocArgs = [
        inputFile,
        '-o', outputFile,
        '--pdf-engine=pdflatex',
        '-V', 'geometry:margin=1in',
        '-V', 'mainfont=Inter',
        '-V', 'sansfont=Inter',
        '-V', 'geometry=a4paper',
      ];

      console.log('Running pandoc with args:', pandocArgs);

      const pandocResult = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        const pandoc = spawn('pandoc', pandocArgs);
        let stderr = '';
        
        pandoc.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        pandoc.on('close', (code) => {
          if (code === 0) {
            resolve({ success: true });
          } else {
            resolve({ success: false, error: stderr });
          }
        });
        
        pandoc.on('error', (err) => {
          resolve({ success: false, error: err.message });
        });
      });

      // Cleanup input file
      await fs.unlink(inputFile).catch(() => {});

      if (!pandocResult.success) {
        console.error('Pandoc error:', pandocResult.error);
        return res.status(500).json({ 
          error: 'PDF-Export fehlgeschlagen: Pandoc Fehler', 
          details: pandocResult.error 
        });
      }

      // Read and send PDF
      const pdfBuffer = await fs.readFile(outputFile);
      await fs.unlink(outputFile).catch(() => {});

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      res.status(500).json({ 
        error: 'PDF-Export fehlgeschlagen.', 
        details: error?.message || 'Unknown error'
      });
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
