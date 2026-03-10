import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app } from '../index';
import { generateToken } from '../middleware/auth';
import { UserModel } from '../models/user';
import { UserSettingsModel } from '../models/userSettings';

jest.mock('../config/database', () => ({
  query: jest.fn(),
}));

jest.mock('../models/user');
jest.mock('../models/userSettings');

// Mock socket.io setup
jest.mock('../services/collaboration', () => ({
  setupSocketIO: jest.fn(),
}));

const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;
const mockSettingsModel = UserSettingsModel as jest.Mocked<typeof UserSettingsModel>;

describe('User Settings API', () => {
  const userId = 'test-user-id';
  const token = generateToken({ userId, email: 'test@example.com' });
  const authHeader = { Authorization: `Bearer ${token}` };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Get user settings
  describe('GET /api/users/settings', () => {
    it('should return user settings', async () => {
      const mockSettings = {
        id: 'settings-1',
        user_id: userId,
        theme: 'dark',
        default_board_id: null,
        vim_mode: false,
        editor_font_size: 14,
        editor_tab_size: 2,
        editor_word_wrap: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSettingsModel.getOrCreate.mockResolvedValue(mockSettings);

      const res = await request(app)
        .get('/api/users/settings')
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.theme).toBe('dark');
      expect(res.body.vim_mode).toBe(false);
    });
  });

  // Test 2: Update settings
  describe('PUT /api/users/settings', () => {
    it('should update theme setting', async () => {
      const updatedSettings = {
        id: 'settings-1',
        user_id: userId,
        theme: 'midnight',
        default_board_id: null,
        vim_mode: false,
        editor_font_size: 14,
        editor_tab_size: 2,
        editor_word_wrap: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSettingsModel.update.mockResolvedValue(updatedSettings);

      const res = await request(app)
        .put('/api/users/settings')
        .set(authHeader)
        .send({ theme: 'midnight' });

      expect(res.status).toBe(200);
      expect(res.body.theme).toBe('midnight');
    });
  });

  // Test 3: Update profile
  describe('PUT /api/users/profile', () => {
    it('should update username', async () => {
      const mockUser = {
        id: userId,
        username: 'oldname',
        email: 'test@example.com',
        password_hash: 'hash',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const updatedUser = { ...mockUser, username: 'newname' };

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUserModel.findByUsername.mockResolvedValue(null);
      mockUserModel.updateProfile.mockResolvedValue(updatedUser);

      const res = await request(app)
        .put('/api/users/profile')
        .set(authHeader)
        .send({ username: 'newname' });

      expect(res.status).toBe(200);
      expect(res.body.username).toBe('newname');
    });

    it('should reject duplicate username', async () => {
      const mockUser = {
        id: userId,
        username: 'myname',
        email: 'test@example.com',
        password_hash: 'hash',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const otherUser = { ...mockUser, id: 'other-id', username: 'taken' };

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUserModel.findByUsername.mockResolvedValue(otherUser);

      const res = await request(app)
        .put('/api/users/profile')
        .set(authHeader)
        .send({ username: 'taken' });

      expect(res.status).toBe(409);
    });
  });

  // Test 4: Change password
  describe('PUT /api/users/password', () => {
    it('should change password with correct current password', async () => {
      const currentPassword = 'oldpassword';
      const hashedPassword = await bcrypt.hash(currentPassword, 10);
      const mockUser = {
        id: userId,
        username: 'test',
        email: 'test@example.com',
        password_hash: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUserModel.updatePassword.mockResolvedValue(undefined);

      const res = await request(app)
        .put('/api/users/password')
        .set(authHeader)
        .send({ currentPassword, newPassword: 'newpassword123' });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Password updated');
    });

    it('should reject wrong current password', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const mockUser = {
        id: userId,
        username: 'test',
        email: 'test@example.com',
        password_hash: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockUserModel.findById.mockResolvedValue(mockUser);

      const res = await request(app)
        .put('/api/users/password')
        .set(authHeader)
        .send({ currentPassword: 'wrongpassword', newPassword: 'newpassword123' });

      expect(res.status).toBe(401);
    });

    it('should reject short new password', async () => {
      const res = await request(app)
        .put('/api/users/password')
        .set(authHeader)
        .send({ currentPassword: 'old', newPassword: '123' });

      expect(res.status).toBe(400);
    });
  });
});
