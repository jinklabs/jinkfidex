import { Request, Response, NextFunction } from "express";
export interface AuthRequest extends Request {
    user?: {
        id: string;
        address: string;
    };
}
export declare function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map