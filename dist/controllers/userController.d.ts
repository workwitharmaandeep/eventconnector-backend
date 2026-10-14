import { Request, Response } from "express";
/**
 * POST /api/users/register
 * Register a new user after Firebase sign-up.
 * Expects Firebase ID token in Authorization header.
 */
export declare function registerUser(req: Request, res: Response): Promise<void>;
/**
 * GET /api/users/me
 * Get the authenticated user's profile.
 */
export declare function getProfile(req: Request, res: Response): Promise<void>;
/**
 * PUT /api/users/me
 * Update the authenticated user's profile.
 */
export declare function updateProfile(req: Request, res: Response): Promise<void>;
/**
 * POST /api/users/check
 * Check if a Firebase user exists in our database.
 * Called after Firebase sign-in to determine if registration is needed.
 */
export declare function checkUser(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=userController.d.ts.map