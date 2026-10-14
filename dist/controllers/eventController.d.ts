import { Request, Response } from "express";
/**
 * GET /api/events
 * List events with comprehensive filtering, sorting, and pagination.
 */
export declare function listEvents(req: Request, res: Response): Promise<void>;
/**
 * GET /api/events/:id
 * Get single event with full details.
 */
export declare function getEvent(req: Request, res: Response): Promise<void>;
/**
 * POST /api/events
 * Create a new event (organizer only).
 */
export declare function createEvent(req: Request, res: Response): Promise<void>;
/**
 * PUT /api/events/:id
 * Update an event (owner or admin only).
 */
export declare function updateEvent(req: Request, res: Response): Promise<void>;
/**
 * DELETE /api/events/:id
 * Delete an event (owner or admin only).
 */
export declare function deleteEvent(req: Request, res: Response): Promise<void>;
/**
 * GET /api/events/organizer/mine
 * Get all events created by the authenticated organizer.
 */
export declare function getMyEvents(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=eventController.d.ts.map