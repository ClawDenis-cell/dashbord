export interface User {
    id: string;
    username: string;
    email: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
}
export interface CreateUserInput {
    username: string;
    email: string;
    password_hash: string;
}
export declare const UserModel: {
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    create(input: CreateUserInput): Promise<User>;
    updateProfile(id: string, input: {
        username?: string;
        email?: string;
    }): Promise<User>;
    updatePassword(id: string, password_hash: string): Promise<void>;
    delete(id: string): Promise<boolean>;
};
//# sourceMappingURL=user.d.ts.map