import { Request, Response } from "express";
/**
 * POST /api/bookmarks
 * Toggle bookmark for an event. If already bookmarked, removes it.
 */
export declare function toggleBookmark(req: Request, res: Response): Promise<void>;
/**
 * GET /api/bookmarks
 * Get all bookmarked events for the authenticated user.
 */
export declare function getBookmarks(req: Request, res: Response): Promise<void>;
/**
 * GET /api/bookmarks/check/:eventId
 * Check if a specific event is bookmarked by the authenticated user.
 */
export declare function checkBookmark(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=bookmarkController.d.ts.map