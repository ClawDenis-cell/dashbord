import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth';
import { UserSettingsModel } from '../models/userSettings';
import { UserModel } from '../models/user';

export const UserSettingsController = {
  async getSettings(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const settings = await UserSettingsModel.getOrCreate(req.userId);
      res.json(settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings.' });
    }
  },

  async updateSettings(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });
      const settings = await UserSettingsModel.update(req.userId, req.body);
      res.json(settings);
    } catch (error: any) {
      console.error('Error updating settings:', error);
      if (error.message?.includes('Invalid theme')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to update settings.' });
    }
  },

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });

      const { username, email } = req.body;
      const user = await UserModel.findById(req.userId);
      if (!user) return res.status(404).json({ error: 'User not found.' });

      if (email && email !== user.email) {
        const existing = await UserModel.findByEmail(email);
        if (existing) return res.status(409).json({ error: 'Email already in use.' });
      }

      if (username && username !== user.username) {
        const existing = await UserModel.findByUsername(username);
        if (existing) return res.status(409).json({ error: 'Username already taken.' });
      }

      const updated = await UserModel.updateProfile(req.userId, { username, email });
      res.json({
        id: updated.id,
        username: updated.username,
        email: updated.email,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile.' });
    }
  },

  async updatePassword(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Not authenticated.' });

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      }

      const user = await UserModel.findById(req.userId);
      if (!user) return res.status(404).json({ error: 'User not found.' });

      const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Current password is incorrect.' });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);
      await UserModel.updatePassword(req.userId, password_hash);

      res.json({ message: 'Password updated successfully.' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ error: 'Failed to update password.' });
    }
  },
};
