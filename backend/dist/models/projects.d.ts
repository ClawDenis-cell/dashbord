export interface Project {
    id: string;
    name: string;
    description: string | null;
    color: string;
    created_at: Date;
    updated_at: Date;
}
export interface CreateProjectInput {
    name: string;
    description?: string;
    color?: string;
}
export interface UpdateProjectInput {
    name?: string;
    description?: string;
    color?: string;
}
export declare const ProjectModel: {
    findAll(): Promise<Project[]>;
    findById(id: string): Promise<Project | null>;
    create(input: CreateProjectInput): Promise<Project>;
    update(id: string, input: UpdateProjectInput): Promise<Project | null>;
    delete(id: string): Promise<boolean>;
};
//# sourceMappingURL=projects.d.ts.map