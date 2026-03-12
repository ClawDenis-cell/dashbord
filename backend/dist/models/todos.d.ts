export interface Todo {
    id: string;
    title: string;
    completed: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface CreateTodoInput {
    title: string;
    completed?: boolean;
}
export interface UpdateTodoInput {
    title?: string;
    completed?: boolean;
}
export declare const TodoModel: {
    findAll(): Promise<Todo[]>;
    findById(id: string): Promise<Todo | null>;
    findByStatus(completed: boolean): Promise<Todo[]>;
    create(input: CreateTodoInput): Promise<Todo>;
    update(id: string, input: UpdateTodoInput): Promise<Todo | null>;
    delete(id: string): Promise<boolean>;
};
//# sourceMappingURL=todos.d.ts.map