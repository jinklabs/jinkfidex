import { Request, Response, NextFunction } from "express";
export declare function withCache(keyFn: (req: Request) => string, ttl: number): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const shortCache: (keyFn: (req: Request) => string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const mediumCache: (keyFn: (req: Request) => string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const longCache: (keyFn: (req: Request) => string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=cache.d.ts.map