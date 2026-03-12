export interface Document {
    id: string;
    title: string;
    content: string;
    owner_id: string;
    project_id: string | null;
    folder_id: string | null;
    created_at: Date;
    updated_at: Date;
}
export interface DocumentCollaborator {
    id: string;
    document_id: string;
    user_id: string;
    permission: 'read' | 'edit';
    joined_at: Date;
}
export interface DocumentInvite {
    id: string;
    document_id: string;
    token: string;
    permission: 'read' | 'edit';
    expires_at: Date;
    created_at: Date;
}
export interface DocumentImage {
    id: string;
    document_id: string;
    filename: string;
    original_name: string;
    mime_type: string;
    size_bytes: number;
    uploaded_by: string;
    created_at: Date;
}
export interface DocumentFolder {
    id: string;
    name: string;
    parent_id: string | null;
    user_id: string;
    created_at: Date;
}
export interface CreateDocumentInput {
    title: string;
    content?: string;
    owner_id: string;
    project_id?: string;
    folder_id?: string | null;
}
export interface UpdateDocumentInput {
    title?: string;
    content?: string;
    project_id?: string | null;
    folder_id?: string | null;
}
export declare const DocumentModel: {
    findAll(userId: string, folderId?: string | null): Promise<Document[]>;
    findById(id: string): Promise<Document | null>;
    findByProjectId(projectId: string, userId: string): Promise<Document[]>;
    create(input: CreateDocumentInput): Promise<Document>;
    update(id: string, input: UpdateDocumentInput): Promise<Document | null>;
    delete(id: string): Promise<boolean>;
    canAccess(documentId: string, userId: string): Promise<"owner" | "edit" | "read" | null>;
    getCollaborators(documentId: string): Promise<(DocumentCollaborator & {
        username: string;
        email: string;
    })[]>;
    addCollaborator(documentId: string, userId: string, permission: "read" | "edit"): Promise<DocumentCollaborator>;
    removeCollaborator(documentId: string, userId: string): Promise<boolean>;
    createInvite(documentId: string, permission: "read" | "edit", expiresInHours?: number): Promise<DocumentInvite>;
    findInviteByToken(token: string): Promise<DocumentInvite | null>;
    deleteInvite(id: string): Promise<boolean>;
    saveImage(input: {
        document_id: string;
        filename: string;
        original_name: string;
        mime_type: string;
        size_bytes: number;
        uploaded_by: string;
    }): Promise<DocumentImage>;
    getImages(documentId: string): Promise<DocumentImage[]>;
    getRecentForUser(userId: string, limit?: number): Promise<Document[]>;
    getFolders(userId: string): Promise<DocumentFolder[]>;
    createFolder(name: string, userId: string, parentId?: string | null): Promise<DocumentFolder>;
    updateFolder(id: string, data: {
        name?: string;
        parent_id?: string | null;
    }): Promise<DocumentFolder | null>;
    deleteFolder(id: string): Promise<boolean>;
    getFolderById(id: string): Promise<DocumentFolder | null>;
};
//# sourceMappingURL=documents.d.ts.map