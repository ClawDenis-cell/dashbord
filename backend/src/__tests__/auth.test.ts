import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app } from '../index';
import { generateToken, verifyToken } from '../middleware/auth';
import { UserModel } from '../models/user';

// Mock the database pool
jest.mock('../config/database', () => ({
  query: jest.fn(),
}));

// Mock the UserModel
jest.mock('../models/user');

const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;

describe('Auth System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: JWT token generation and verification
  describe('JWT Token', () => {
    it('should generate and verify a valid token', () => {
      const payload = { userId: 'test-uuid-123', email: 'test@example.com' };
      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should reject an invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow();
    });
  });

  // Test 2: Registration endpoint
  describe('POST /api/auth/register', () => {
    it('should register a new user and return a token', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 'uuid-1',
        username: 'testuser',
        email: 'test@example.com',
        password_hash: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockUserModel.findByEmail.mockResolvedValue(null);
      mockUserModel.findByUsername.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.username).toBe('testuser');
      // Should not expose password hash
      expect(res.body.user).not.toHaveProperty('password_hash');
    });

    it('should reject registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject registration with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'test', email: 'test@example.com', password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('6 characters');
    });

    it('should reject duplicate email', async () => {
      mockUserModel.findByEmail.mockResolvedValue({
        id: 'existing-uuid',
        username: 'existing',
        email: 'test@example.com',
        password_hash: 'hash',
        created_at: new Date(),
        updated_at: new Date(),
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'newuser', email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('Email already registered');
    });
  });

  // Test 3: Login endpoint
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials and return token', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const mockUser = {
        id: 'uuid-1',
        username: 'testuser',
        email: 'test@example.com',
        password_hash: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockUserModel.findByEmail.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should reject login with wrong password', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const mockUser = {
        id: 'uuid-1',
        username: 'testuser',
        email: 'test@example.com',
        password_hash: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockUserModel.findByEmail.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid');
    });

    it('should reject login with non-existent email', async () => {
      mockUserModel.findByEmail.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'notfound@example.com', password: 'password123' });

      expect(res.status).toBe(401);
    });
  });

  // Test 4: Protected route access
  describe('Auth Middleware - Protected Routes', () => {
    it('should deny access without token', async () => {
      const res = await request(app).get('/api/todos');

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Access denied');
    });

    it('should deny access with invalid token', async () => {
      const res = await request(app)
        .get('/api/todos')
        .set('Authorization', 'Bearer invalid-token-here');

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid');
    });
  });

  // Test 5: Health check remains public
  describe('Public Routes', () => {
    it('health check should be accessible without auth', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  // Test 6: GET /api/auth/me endpoint
  describe('GET /api/auth/me', () => {
    it('should return user info with valid token', async () => {
      const mockUser = {
        id: 'uuid-1',
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hash',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockUserModel.findById.mockResolvedValue(mockUser);

      const token = generateToken({ userId: 'uuid-1', email: 'test@example.com' });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('test@example.com');
      expect(res.body.username).toBe('testuser');
      // Should not expose password_hash
      expect(res.body).not.toHaveProperty('password_hash');
    });
  });
});
