import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const AuthController: {
    register(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    me(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=auth.d.ts.map