import { Request, Response } from 'express';
export declare const KanbanConfigController: {
    getConfig(req: Request, res: Response): Promise<void>;
    getAll(req: Request, res: Response): Promise<void>;
    create(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    update(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    delete(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=kanbanConfig.d.ts.map