import apiClient from './client';

export interface UserSettings {
  id: string;
  user_id: string;
  theme: string;
  default_board_id: string | null;
  vim_mode: boolean;
  editor_font_size: number;
  editor_tab_size: number;
  editor_word_wrap: boolean;
  created_at: string;
  updated_at: string;
}

export const userSettingsApi = {
  getSettings: () => apiClient.get<UserSettings>('/users/settings'),
  updateSettings: (data: Partial<UserSettings>) => apiClient.put<UserSettings>('/users/settings', data),
  updateProfile: (data: { username?: string; email?: string }) => apiClient.put('/users/profile', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) => apiClient.put('/users/password', data),
};
