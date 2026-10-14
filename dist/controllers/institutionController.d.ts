import { Request, Response } from "express";
/**
 * GET /api/institutions
 * List all institutions with optional search.
 */
export declare function listInstitutions(req: Request, res: Response): Promise<void>;
/**
 * GET /api/institutions/:id
 * Get single institution with campus map data and linked events.
 */
export declare function getInstitution(req: Request, res: Response): Promise<void>;
/**
 * POST /api/institutions
 * Create a new institution (organizer only).
 */
export declare function createInstitution(req: Request, res: Response): Promise<void>;
/**
 * PUT /api/institutions/:id
 * Update an institution (creator or admin only).
 */
export declare function updateInstitution(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=institutionController.d.ts.map