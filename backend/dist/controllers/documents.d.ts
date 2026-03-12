import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const DocumentController: {
    getAll(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getByProject(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getRecent(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    create(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    update(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    delete(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCollaborators(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    addCollaborator(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    removeCollaborator(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createInvite(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    acceptInvite(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    uploadImage(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    uploadImageUrl(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    exportHtml(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    exportPdf(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getFolders(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createFolder(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateFolder(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteFolder(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=documents.d.ts.map