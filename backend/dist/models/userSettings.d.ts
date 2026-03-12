export interface UserSettings {
    id: string;
    user_id: string;
    theme: string;
    default_board_id: string | null;
    vim_mode: boolean;
    editor_font_size: number;
    editor_tab_size: number;
    editor_word_wrap: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface UpdateUserSettingsInput {
    theme?: string;
    default_board_id?: string | null;
    vim_mode?: boolean;
    editor_font_size?: number;
    editor_tab_size?: number;
    editor_word_wrap?: boolean;
}
export declare const UserSettingsModel: {
    findByUserId(userId: string): Promise<UserSettings | null>;
    getOrCreate(userId: string): Promise<UserSettings>;
    update(userId: string, input: UpdateUserSettingsInput): Promise<UserSettings>;
};
//# sourceMappingURL=userSettings.d.ts.map