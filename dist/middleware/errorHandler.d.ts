import { Request, Response, NextFunction } from "express";
interface AppError extends Error {
    statusCode?: number;
    code?: string;
}
export declare function errorHandler(err: AppError, req: Request, res: Response, _next: NextFunction): void;
export declare function notFoundHandler(req: Request, res: Response): void;
export {};
//# sourceMappingURL=errorHandler.d.ts.map