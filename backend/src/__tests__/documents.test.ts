import request from 'supertest';
import { app } from '../index';
import { generateToken } from '../middleware/auth';
import { DocumentModel } from '../models/documents';
import { UserModel } from '../models/user';
import { UserSettingsModel } from '../models/userSettings';

// Mock the database pool
jest.mock('../config/database', () => ({
  query: jest.fn(),
}));

jest.mock('../models/documents');
jest.mock('../models/user');
jest.mock('../models/userSettings');

// Mock socket.io setup
jest.mock('../services/collaboration', () => ({
  setupSocketIO: jest.fn(),
}));

const mockDocumentModel = DocumentModel as jest.Mocked<typeof DocumentModel>;
const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;

describe('Documents API', () => {
  const userId = 'test-user-id';
  const token = generateToken({ userId, email: 'test@example.com' });
  const authHeader = { Authorization: `Bearer ${token}` };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: List documents
  describe('GET /api/documents', () => {
    it('should return all documents for the user', async () => {
      const mockDocs = [
        { id: 'doc-1', title: 'Test Doc', content: '# Hello', owner_id: userId, project_id: null, created_at: new Date(), updated_at: new Date() },
        { id: 'doc-2', title: 'Another Doc', content: 'Content', owner_id: userId, project_id: null, created_at: new Date(), updated_at: new Date() },
      ];

      mockDocumentModel.findAll.mockResolvedValue(mockDocs);

      const res = await request(app)
        .get('/api/documents')
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].title).toBe('Test Doc');
    });

    it('should deny access without token', async () => {
      const res = await request(app).get('/api/documents');
      expect(res.status).toBe(401);
    });
  });

  // Test 2: Create document
  describe('POST /api/documents', () => {
    it('should create a new document', async () => {
      const newDoc = {
        id: 'doc-new',
        title: 'New Document',
        content: '',
        owner_id: userId,
        project_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDocumentModel.create.mockResolvedValue(newDoc);

      const res = await request(app)
        .post('/api/documents')
        .set(authHeader)
        .send({ title: 'New Document' });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('New Document');
    });

    it('should reject creation without title', async () => {
      const res = await request(app)
        .post('/api/documents')
        .set(authHeader)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Title');
    });
  });

  // Test 3: Get single document with access check
  describe('GET /api/documents/:id', () => {
    it('should return document for owner', async () => {
      const mockDoc = {
        id: 'doc-1',
        title: 'Test',
        content: 'Content',
        owner_id: userId,
        project_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDocumentModel.canAccess.mockResolvedValue('owner');
      mockDocumentModel.findById.mockResolvedValue(mockDoc);
      mockDocumentModel.getCollaborators.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/documents/doc-1')
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Test');
      expect(res.body.access).toBe('owner');
    });

    it('should return 404 for inaccessible document', async () => {
      mockDocumentModel.canAccess.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/documents/doc-unknown')
        .set(authHeader);

      expect(res.status).toBe(404);
    });
  });

  // Test 4: Update document with permission check
  describe('PUT /api/documents/:id', () => {
    it('should update document for owner', async () => {
      const updatedDoc = {
        id: 'doc-1',
        title: 'Updated Title',
        content: 'Updated content',
        owner_id: userId,
        project_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDocumentModel.canAccess.mockResolvedValue('owner');
      mockDocumentModel.update.mockResolvedValue(updatedDoc);

      const res = await request(app)
        .put('/api/documents/doc-1')
        .set(authHeader)
        .send({ title: 'Updated Title', content: 'Updated content' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Title');
    });

    it('should reject update for read-only user', async () => {
      mockDocumentModel.canAccess.mockResolvedValue('read');

      const res = await request(app)
        .put('/api/documents/doc-1')
        .set(authHeader)
        .send({ content: 'Trying to edit' });

      expect(res.status).toBe(403);
    });
  });

  // Test 5: Delete document (owner only)
  describe('DELETE /api/documents/:id', () => {
    it('should delete document for owner', async () => {
      mockDocumentModel.canAccess.mockResolvedValue('owner');
      mockDocumentModel.delete.mockResolvedValue(true);

      const res = await request(app)
        .delete('/api/documents/doc-1')
        .set(authHeader);

      expect(res.status).toBe(200);
    });

    it('should reject delete for non-owner', async () => {
      mockDocumentModel.canAccess.mockResolvedValue('edit');

      const res = await request(app)
        .delete('/api/documents/doc-1')
        .set(authHeader);

      expect(res.status).toBe(403);
    });
  });

  // Test 6: Invite system
  describe('POST /api/documents/:id/invites', () => {
    it('should create invite for owner', async () => {
      const mockInvite = {
        id: 'invite-1',
        document_id: 'doc-1',
        token: 'abc123',
        permission: 'edit' as const,
        expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000),
        created_at: new Date(),
      };

      mockDocumentModel.canAccess.mockResolvedValue('owner');
      mockDocumentModel.createInvite.mockResolvedValue(mockInvite);

      const res = await request(app)
        .post('/api/documents/doc-1/invites')
        .set(authHeader)
        .send({ permission: 'edit' });

      expect(res.status).toBe(201);
      expect(res.body.token).toBe('abc123');
    });

    it('should reject invite creation for non-owner', async () => {
      mockDocumentModel.canAccess.mockResolvedValue('edit');

      const res = await request(app)
        .post('/api/documents/doc-1/invites')
        .set(authHeader)
        .send({ permission: 'read' });

      expect(res.status).toBe(403);
    });
  });

  // Test 7: Accept invite
  describe('POST /api/documents/invites/:token/accept', () => {
    it('should accept valid invite', async () => {
      const mockInvite = {
        id: 'invite-1',
        document_id: 'doc-1',
        token: 'valid-token',
        permission: 'edit' as const,
        expires_at: new Date(Date.now() + 1000000),
        created_at: new Date(),
      };
      const mockDoc = {
        id: 'doc-1',
        title: 'Shared Doc',
        content: '',
        owner_id: 'other-user',
        project_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDocumentModel.findInviteByToken.mockResolvedValue(mockInvite);
      mockDocumentModel.findById.mockResolvedValue(mockDoc);
      mockDocumentModel.addCollaborator.mockResolvedValue({
        id: 'collab-1',
        document_id: 'doc-1',
        user_id: userId,
        permission: 'edit',
        joined_at: new Date(),
      });

      const res = await request(app)
        .post('/api/documents/invites/valid-token/accept')
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('accepted');
    });

    it('should reject expired invite', async () => {
      mockDocumentModel.findInviteByToken.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/documents/invites/expired-token/accept')
        .set(authHeader);

      expect(res.status).toBe(404);
    });
  });
});
