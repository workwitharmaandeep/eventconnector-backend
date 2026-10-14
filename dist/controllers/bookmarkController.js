"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleBookmark = toggleBookmark;
exports.getBookmarks = getBookmarks;
exports.checkBookmark = checkBookmark;
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * POST /api/bookmarks
 * Toggle bookmark for an event. If already bookmarked, removes it.
 */
async function toggleBookmark(req, res) {
    try {
        const { eventId } = req.body;
        if (!eventId) {
            res.status(400).json({ error: "eventId is required" });
            return;
        }
        // Check if event exists
        const event = await prisma_1.default.event.findUnique({ where: { id: eventId } });
        if (!event) {
            res.status(404).json({ error: "Event not found" });
            return;
        }
        // Check if already bookmarked
        const existing = await prisma_1.default.bookmark.findUnique({
            where: {
                userId_eventId: {
                    userId: req.user.userId,
                    eventId,
                },
            },
        });
        if (existing) {
            // Remove bookmark
            await prisma_1.default.bookmark.delete({ where: { id: existing.id } });
            res.json({ bookmarked: false, message: "Bookmark removed" });
        }
        else {
            // Add bookmark
            await prisma_1.default.bookmark.create({
                data: {
                    userId: req.user.userId,
                    eventId,
                },
            });
            res.json({ bookmarked: true, message: "Event bookmarked" });
        }
    }
    catch (error) {
        console.error("Error toggling bookmark:", error);
        res.status(500).json({ error: "Failed to toggle bookmark" });
    }
}
/**
 * GET /api/bookmarks
 * Get all bookmarked events for the authenticated user.
 */
async function getBookmarks(req, res) {
    try {
        const bookmarks = await prisma_1.default.bookmark.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: "desc" },
            include: {
                event: {
                    include: {
                        organizer: {
                            select: { id: true, name: true, avatarUrl: true },
                        },
                        _count: {
                            select: { bookmarks: true, views: true },
                        },
                    },
                },
            },
        });
        const events = bookmarks.map((b) => b.event);
        res.json({ events });
    }
    catch (error) {
        console.error("Error getting bookmarks:", error);
        res.status(500).json({ error: "Failed to fetch bookmarks" });
    }
}
/**
 * GET /api/bookmarks/check/:eventId
 * Check if a specific event is bookmarked by the authenticated user.
 */
async function checkBookmark(req, res) {
    try {
        const eventId = req.params.eventId;
        const bookmark = await prisma_1.default.bookmark.findUnique({
            where: {
                userId_eventId: {
                    userId: req.user.userId,
                    eventId,
                },
            },
        });
        res.json({ bookmarked: !!bookmark });
    }
    catch (error) {
        console.error("Error checking bookmark:", error);
        res.status(500).json({ error: "Failed to check bookmark" });
    }
}
//# sourceMappingURL=bookmarkController.js.map