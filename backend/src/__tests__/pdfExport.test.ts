// Test für PDF-Generierung
import request from 'supertest';
import { app } from '../src/index';
import { DocumentModel } from '../src/models/documents';
import jwt from 'jsonwebtoken';

// Mock für PDF-Generierung
jest.setTimeout(30000);

describe('PDF Export', () => {
  let authToken: string;
  let userId: string;
  let documentId: string;

  beforeAll(async () => {
    // Test-User erstellen
    userId = 'test-user-id';
    authToken = jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret');
    
    // Test-Dokument erstellen
    const doc = await DocumentModel.create({
      title: 'Test Document',
      content: '# Test\n\nThis is a test document.',
      owner_id: userId,
    });
    documentId = doc.id;
  });

  afterAll(async () => {
    // Cleanup
    if (documentId) {
      await DocumentModel.delete(documentId);
    }
  });

  it('should export document as PDF', async () => {
    const res = await request(app)
      .get(`/api/documents/${documentId}/export/pdf`)
      .set('Authorization', `Bearer ${authToken}`);

    console.log('PDF Export Response:', {
      status: res.status,
      contentType: res.headers['content-type'],
      contentLength: res.headers['content-length'],
    });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.body.length).toBeGreaterThan(1000); // PDF sollte mindestens 1KB sein
  });

  it('should return 404 for non-existent document', async () => {
    const res = await request(app)
      .get('/api/documents/non-existent-id/export/pdf')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
  });

  it('should check PDF generation health', async () => {
    const res = await request(app)
      .get('/api/pdf/health')
      .set('Authorization', `Bearer ${authToken}`);

    console.log('PDF Health Check:', res.body);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });
});
