import { Request, Response } from "express";
import prisma from "../lib/prisma";

/**
 * POST /api/bookmarks
 * Toggle bookmark for an event. If already bookmarked, removes it.
 */
export async function toggleBookmark(req: Request, res: Response): Promise<void> {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      res.status(400).json({ error: "eventId is required" });
      return;
    }

    // Check if event exists
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    // Check if already bookmarked
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_eventId: {
          userId: req.user!.userId,
          eventId,
        },
      },
    });

    if (existing) {
      // Remove bookmark
      await prisma.bookmark.delete({ where: { id: existing.id } });
      res.json({ bookmarked: false, message: "Bookmark removed" });
    } else {
      // Add bookmark
      await prisma.bookmark.create({
        data: {
          userId: req.user!.userId,
          eventId,
        },
      });
      res.json({ bookmarked: true, message: "Event bookmarked" });
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    res.status(500).json({ error: "Failed to toggle bookmark" });
  }
}

/**
 * GET /api/bookmarks
 * Get all bookmarked events for the authenticated user.
 */
export async function getBookmarks(req: Request, res: Response): Promise<void> {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user!.userId },
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
  } catch (error) {
    console.error("Error getting bookmarks:", error);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
}

/**
 * GET /api/bookmarks/check/:eventId
 * Check if a specific event is bookmarked by the authenticated user.
 */
export async function checkBookmark(req: Request, res: Response): Promise<void> {
  try {
    const eventId = req.params.eventId as string;

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_eventId: {
          userId: req.user!.userId,
          eventId,
        },
      },
    });

    res.json({ bookmarked: !!bookmark });
  } catch (error) {
    console.error("Error checking bookmark:", error);
    res.status(500).json({ error: "Failed to check bookmark" });
  }
}
