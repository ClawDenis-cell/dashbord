export interface KanbanConfig {
    id: string;
    board_name: string;
    columns_array: string[];
    user_id: string;
    created_at: Date;
    updated_at: Date;
}
export interface CreateKanbanConfigInput {
    board_name?: string;
    columns_array?: string[];
    user_id?: string;
}
export interface UpdateKanbanConfigInput {
    board_name?: string;
    columns_array?: string[];
}
export declare const KanbanConfigModel: {
    findByUserId(userId?: string): Promise<KanbanConfig | null>;
    findAll(): Promise<KanbanConfig[]>;
    create(input: CreateKanbanConfigInput): Promise<KanbanConfig>;
    update(userId: string, input: UpdateKanbanConfigInput): Promise<KanbanConfig | null>;
    delete(id: string): Promise<boolean>;
};
//# sourceMappingURL=kanbanConfig.d.ts.map