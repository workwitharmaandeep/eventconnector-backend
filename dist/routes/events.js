"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventController_1 = require("../controllers/eventController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get("/", eventController_1.listEvents);
// Organizer routes (must be defined BEFORE /:id to avoid collision)
router.get("/organizer/my-events", auth_1.requireAuth, auth_1.requireOrganizer, eventController_1.getMyEvents);
// Event detail (optionalAuth for tracking view & user-specific context)
router.get("/:id", auth_1.optionalAuth, eventController_1.getEvent);
// Protected mutation routes
router.post("/", auth_1.requireAuth, auth_1.requireOrganizer, eventController_1.createEvent);
router.put("/:id", auth_1.requireAuth, auth_1.requireOrganizer, eventController_1.updateEvent);
router.delete("/:id", auth_1.requireAuth, auth_1.requireOrganizer, eventController_1.deleteEvent);
exports.default = router;
//# sourceMappingURL=events.js.map