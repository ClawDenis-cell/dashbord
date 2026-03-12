export interface Ticket {
    id: string;
    title: string;
    description: string | null;
    project_id: string | null;
    board_id: string | null;
    status: string;
    priority: string;
    column_name: string;
    created_at: Date;
    updated_at: Date;
}
export interface CreateTicketInput {
    title: string;
    description?: string;
    project_id?: string;
    board_id?: string;
    status?: string;
    priority?: string;
    column_name?: string;
}
export interface UpdateTicketInput {
    title?: string;
    description?: string;
    project_id?: string;
    board_id?: string;
    status?: string;
    priority?: string;
    column_name?: string;
}
export declare const TicketModel: {
    findAll(): Promise<Ticket[]>;
    findById(id: string): Promise<Ticket | null>;
    findByProjectId(projectId: string): Promise<Ticket[]>;
    findByBoardId(boardId: string): Promise<Ticket[]>;
    create(input: CreateTicketInput): Promise<Ticket>;
    update(id: string, input: UpdateTicketInput): Promise<Ticket | null>;
    delete(id: string): Promise<boolean>;
};
//# sourceMappingURL=tickets.d.ts.map