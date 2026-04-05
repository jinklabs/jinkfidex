import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare function submitStaking(req: AuthRequest, res: Response): Promise<void>;
export declare function listStakingSubmissions(req: Request, res: Response): Promise<void>;
export declare function myStakingSubmissions(req: AuthRequest, res: Response): Promise<void>;
export declare function approveStakingSubmission(req: AuthRequest, res: Response): Promise<void>;
export declare function rejectStakingSubmission(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=staking.controller.d.ts.map