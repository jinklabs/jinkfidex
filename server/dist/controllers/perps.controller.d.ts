import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare function submitPerps(req: AuthRequest, res: Response): Promise<void>;
export declare function listPerpsSubmissions(req: Request, res: Response): Promise<void>;
export declare function myPerpsSubmissions(req: AuthRequest, res: Response): Promise<void>;
export declare function approvePerpsSubmission(req: AuthRequest, res: Response): Promise<void>;
export declare function rejectPerpsSubmission(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=perps.controller.d.ts.map