import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const UserSettingsController: {
    searchUsers(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getSettings(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateSettings(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateProfile(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updatePassword(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=userSettings.d.ts.map