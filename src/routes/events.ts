import { Router } from "express";
import {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
} from "../controllers/eventController";
import { requireAuth, requireOrganizer, optionalAuth } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/", listEvents);

// Organizer routes (must be defined BEFORE /:id to avoid collision)
router.get("/organizer/my-events", requireAuth, requireOrganizer, getMyEvents);

// Event detail (optionalAuth for tracking view & user-specific context)
router.get("/:id", optionalAuth, getEvent);

// Protected mutation routes
router.post("/", requireAuth, requireOrganizer, createEvent);
router.put("/:id", requireAuth, requireOrganizer, updateEvent);
router.delete("/:id", requireAuth, requireOrganizer, deleteEvent);

export default router;
