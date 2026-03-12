export interface KanbanBoard {
    id: string;
    name: string;
    project_id: string;
    columns_array: string[];
    created_at: Date;
    updated_at: Date;
}
export interface CreateKanbanBoardInput {
    name: string;
    project_id: string;
    columns_array?: string[];
}
export interface UpdateKanbanBoardInput {
    name?: string;
    columns_array?: string[];
}
export declare const KanbanBoardModel: {
    findByProjectId(projectId: string): Promise<KanbanBoard[]>;
    findById(id: string): Promise<KanbanBoard | null>;
    findByProjectAndId(projectId: string, id: string): Promise<KanbanBoard | null>;
    create(input: CreateKanbanBoardInput): Promise<KanbanBoard>;
    update(id: string, input: UpdateKanbanBoardInput): Promise<KanbanBoard | null>;
    delete(id: string): Promise<boolean>;
    countByProjectId(projectId: string): Promise<number>;
};
//# sourceMappingURL=kanbanBoards.d.ts.map