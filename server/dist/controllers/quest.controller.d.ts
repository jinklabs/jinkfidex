import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare function submitQuest(req: AuthRequest, res: Response): Promise<void>;
export declare function listSubmissions(req: AuthRequest, res: Response): Promise<void>;
export declare function mySubmissions(req: AuthRequest, res: Response): Promise<void>;
export declare function approveSubmission(req: AuthRequest, res: Response): Promise<void>;
export declare function rejectSubmission(req: AuthRequest, res: Response): Promise<void>;
export declare function listQuests(req: Request, res: Response): Promise<void>;
export declare function getQuest(req: Request, res: Response): Promise<void>;
export declare function getLeaderboard(req: Request, res: Response): Promise<void>;
export declare function getUserProgress(req: AuthRequest, res: Response): Promise<void>;
export declare function verifyTask(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=quest.controller.d.ts.map