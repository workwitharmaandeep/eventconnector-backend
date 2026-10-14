import { Request, Response, NextFunction } from "express";
declare global {
    namespace Express {
        interface Request {
            user?: {
                uid: string;
                email: string;
                userId: string;
                role: string;
            };
        }
    }
}
/**
 * Middleware that verifies Firebase ID token from Authorization header.
 * Attaches decoded user info to req.user.
 * Returns 401 if token is missing or invalid.
 */
export declare function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Optional auth middleware - doesn't reject if no token,
 * but attaches user info if token is present.
 */
export declare function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Middleware that checks if the authenticated user has the ORGANIZER role.
 * Must be used after requireAuth.
 */
export declare function requireOrganizer(req: Request, res: Response, next: NextFunction): void;
/**
 * Middleware that checks if the authenticated user has the ADMIN role.
 * Must be used after requireAuth.
 */
export declare function requireAdmin(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map