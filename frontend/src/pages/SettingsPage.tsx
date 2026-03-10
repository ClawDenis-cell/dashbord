import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore, useSettingsStore, useThemeStore, useKanbanBoardStore } from '../store';
import { ThemeName } from '../store/themeStore';

type Tab = 'profile' | 'security' | 'appearance' | 'editor';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'editor', label: 'Editor' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
        Settings
      </h1>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              background: activeTab === tab.id ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'appearance' && <AppearanceTab />}
        {activeTab === 'editor' && <EditorTab />}
      </motion.div>
    </div>
  );
};

function ProfileTab() {
  const { user, checkAuth } = useAuthStore();
  const { updateProfile } = useSettingsStore();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await updateProfile({ username, email });
      await checkAuth();
      setMessage('Profile updated successfully.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="glass-card p-6 max-w-lg">
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
        Profile Information
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
        </div>
        {message && <p className="text-sm text-green-400">{message}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" className="btn-primary">Save Changes</button>
      </form>
    </div>
  );
}

function SecurityTab() {
  const { updatePassword } = useSettingsStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await updatePassword({ currentPassword, newPassword });
      setMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="glass-card p-6 max-w-lg">
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
        Change Password
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
          />
        </div>
        {message && <p className="text-sm text-green-400">{message}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" className="btn-primary">Update Password</button>
      </form>
    </div>
  );
}

function AppearanceTab() {
  const { theme, setTheme } = useThemeStore();
  const { settings, updateSettings, fetchSettings } = useSettingsStore();
  const { boards } = useKanbanBoardStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const themeOptions: { id: ThemeName; label: string; preview: string[] }[] = [
    { id: 'dark', label: 'Dark', preview: ['#0f172a', '#1e293b', '#8b5cf6'] },
    { id: 'light', label: 'Light', preview: ['#f8fafc', '#ffffff', '#7c3aed'] },
    { id: 'midnight', label: 'Midnight', preview: ['#0a0e27', '#131842', '#6366f1'] },
    { id: 'sunset', label: 'Sunset', preview: ['#1a0f0a', '#2d1810', '#f97316'] },
    { id: 'forest', label: 'Forest', preview: ['#0a1a0f', '#122118', '#22c55e'] },
    { id: 'ocean', label: 'Ocean', preview: ['#0a1520', '#0f2133', '#06b6d4'] },
  ];

  const handleThemeChange = async (t: ThemeName) => {
    setTheme(t);
    try {
      await updateSettings({ theme: t });
    } catch {
      // Theme already applied visually
    }
  };

  const handleDefaultBoard = async (boardId: string | null) => {
    try {
      await updateSettings({ default_board_id: boardId } as any);
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Theme
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {themeOptions.map((t) => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id)}
              className="p-4 rounded-xl border-2 transition-all text-left"
              style={{
                borderColor: theme === t.id ? 'var(--color-accent)' : 'var(--color-border)',
                background: 'var(--color-bg-secondary)',
              }}
            >
              <div className="flex gap-1 mb-2">
                {t.preview.map((color, i) => (
                  <div key={i} className="w-6 h-6 rounded-full" style={{ background: color }} />
                ))}
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {t.label}
              </span>
              {theme === t.id && (
                <span className="ml-2 text-xs" style={{ color: 'var(--color-accent)' }}>Active</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 max-w-lg">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Default Kanban Board
        </h2>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          Select a board to show automatically when you open the dashboard.
        </p>
        <select
          value={settings?.default_board_id || ''}
          onChange={(e) => handleDefaultBoard(e.target.value || null)}
          className="input-field"
        >
          <option value="">No default board</option>
          {boards.map((board) => (
            <option key={board.id} value={board.id}>{board.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function EditorTab() {
  const { settings, updateSettings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = async (key: string, value: any) => {
    try {
      await updateSettings({ [key]: value } as any);
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="glass-card p-6 max-w-lg">
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
        Editor Preferences
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Vim Mode</label>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Use Vim keybindings in the editor</p>
          </div>
          <button
            onClick={() => handleChange('vim_mode', !settings?.vim_mode)}
            className="w-12 h-6 rounded-full transition-colors relative"
            style={{
              background: settings?.vim_mode ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
            }}
          >
            <div
              className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform"
              style={{
                transform: settings?.vim_mode ? 'translateX(26px)' : 'translateX(2px)',
              }}
            />
          </button>
        </div>

        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Font Size</label>
          <input
            type="number"
            min="10"
            max="24"
            value={settings?.editor_font_size || 14}
            onChange={(e) => handleChange('editor_font_size', parseInt(e.target.value))}
            className="input-field w-24"
          />
        </div>

        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Tab Size</label>
          <select
            value={settings?.editor_tab_size || 2}
            onChange={(e) => handleChange('editor_tab_size', parseInt(e.target.value))}
            className="input-field w-24"
          >
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="8">8</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Word Wrap</label>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Wrap long lines in the editor</p>
          </div>
          <button
            onClick={() => handleChange('editor_word_wrap', !settings?.editor_word_wrap)}
            className="w-12 h-6 rounded-full transition-colors relative"
            style={{
              background: settings?.editor_word_wrap !== false ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
            }}
          >
            <div
              className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform"
              style={{
                transform: settings?.editor_word_wrap !== false ? 'translateX(26px)' : 'translateX(2px)',
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
