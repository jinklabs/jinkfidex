import { Request, Response } from "express";
export declare function getNonce(req: Request, res: Response): Promise<void>;
export declare function verifySignature(req: Request, res: Response): Promise<void>;
export declare function getMe(req: Request & {
    user?: {
        id: string;
        address: string;
    };
}, res: Response): Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map