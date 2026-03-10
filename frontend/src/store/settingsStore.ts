import { create } from 'zustand';
import { userSettingsApi, UserSettings } from '../api/userSettings';
import { useThemeStore, ThemeName } from './themeStore';

interface SettingsState {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<UserSettings>) => Promise<void>;
  updateProfile: (data: { username?: string; email?: string }) => Promise<any>;
  updatePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await userSettingsApi.getSettings();
      set({ settings: res.data, loading: false });

      // Apply theme from settings
      const theme = res.data.theme as ThemeName;
      if (theme) {
        useThemeStore.getState().setTheme(theme);
      }
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to load settings', loading: false });
    }
  },

  updateSettings: async (data) => {
    set({ error: null });
    try {
      const res = await userSettingsApi.updateSettings(data);
      set({ settings: res.data });

      // Apply theme if changed
      if (data.theme) {
        useThemeStore.getState().setTheme(data.theme as ThemeName);
      }
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to update settings';
      set({ error: message });
      throw new Error(message);
    }
  },

  updateProfile: async (data) => {
    set({ error: null });
    try {
      const res = await userSettingsApi.updateProfile(data);
      return res.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to update profile';
      set({ error: message });
      throw new Error(message);
    }
  },

  updatePassword: async (data) => {
    set({ error: null });
    try {
      await userSettingsApi.updatePassword(data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to update password';
      set({ error: message });
      throw new Error(message);
    }
  },
}));
