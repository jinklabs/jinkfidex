import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare function listLocks(req: Request, res: Response): Promise<void>;
export declare function getLock(req: Request, res: Response): Promise<void>;
export declare function createLock(req: AuthRequest, res: Response): Promise<void>;
export declare function markWithdrawn(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=lock.controller.d.ts.map