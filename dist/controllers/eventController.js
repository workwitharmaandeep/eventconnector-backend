"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEvents = listEvents;
exports.getEvent = getEvent;
exports.createEvent = createEvent;
exports.updateEvent = updateEvent;
exports.deleteEvent = deleteEvent;
exports.getMyEvents = getMyEvents;
const prisma_1 = __importDefault(require("../lib/prisma"));
const fallbackData_1 = require("../lib/fallbackData");
/**
 * GET /api/events
 * List events with comprehensive filtering, sorting, and pagination.
 */
async function listEvents(req, res) {
    try {
        const { q, type, mode, source, domains, skills, city, state, country, startAfter, startBefore, deadlineStatus, lat, lng, radius, sort = "newest", page = "1", limit = "12", } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;
        // Build dynamic where clause
        const where = {
            isApproved: true,
        };
        // Full-text search on title and description
        if (q) {
            where.OR = [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
            ];
        }
        // Event type filter (comma-separated)
        if (type) {
            const types = type.split(",").map((t) => t.trim().toUpperCase());
            where.eventType = { in: types };
        }
        // Mode filter
        if (mode) {
            const modes = mode.split(",").map((m) => m.trim().toUpperCase());
            where.mode = { in: modes };
        }
        // Source filter
        if (source) {
            const sources = source.split(",").map((s) => s.trim().toUpperCase());
            where.source = { in: sources };
        }
        // Domain filter
        if (domains) {
            const domainList = domains.split(",").map((d) => d.trim());
            where.domains = { hasSome: domainList };
        }
        // Skills filter
        if (skills) {
            const skillList = skills.split(",").map((s) => s.trim());
            where.requiredSkills = { hasSome: skillList };
        }
        // Location filters
        if (city)
            where.city = { contains: city, mode: "insensitive" };
        if (state)
            where.state = { contains: state, mode: "insensitive" };
        if (country)
            where.country = { contains: country, mode: "insensitive" };
        // Date range filters
        if (startAfter)
            where.startDate = { ...where.startDate, gte: new Date(startAfter) };
        if (startBefore)
            where.startDate = { ...where.startDate, lte: new Date(startBefore) };
        // Registration deadline status
        if (deadlineStatus) {
            const now = new Date();
            switch (deadlineStatus) {
                case "open":
                    where.registrationDeadline = { gt: now };
                    break;
                case "closing-soon":
                    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
                    where.registrationDeadline = { gt: now, lte: threeDaysLater };
                    break;
                case "closed":
                    where.registrationDeadline = { lt: now };
                    break;
            }
        }
        // Sort options
        let orderBy = {};
        switch (sort) {
            case "soonest":
                orderBy = { startDate: "asc" };
                break;
            case "deadline":
                orderBy = { registrationDeadline: "asc" };
                break;
            case "popular":
                orderBy = { views: { _count: "desc" } };
                break;
            case "oldest":
                orderBy = { createdAt: "asc" };
                break;
            case "newest":
            default:
                orderBy = { createdAt: "desc" };
                break;
        }
        const [events, total] = await Promise.all([
            prisma_1.default.event.findMany({
                where,
                orderBy,
                skip,
                take: limitNum,
                include: {
                    organizer: {
                        select: { id: true, name: true, avatarUrl: true },
                    },
                    institutions: {
                        include: {
                            institution: {
                                select: { id: true, name: true, city: true },
                            },
                        },
                    },
                    _count: {
                        select: { bookmarks: true, views: true },
                    },
                },
            }),
            prisma_1.default.event.count({ where }),
        ]);
        // If geo params provided, compute distances and sort by nearest
        let processedEvents = events;
        if (lat && lng && radius) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);
            const maxRadius = parseFloat(radius); // in km
            processedEvents = events
                .map((event) => {
                if (event.latitude && event.longitude) {
                    const distance = haversineDistance(userLat, userLng, event.latitude, event.longitude);
                    return { ...event, distance };
                }
                return { ...event, distance: null };
            })
                .filter((event) => event.distance === null || event.distance <= maxRadius);
            if (sort === "nearest") {
                processedEvents.sort((a, b) => {
                    if (a.distance === null)
                        return 1;
                    if (b.distance === null)
                        return -1;
                    return a.distance - b.distance;
                });
            }
        }
        res.json({
            events: processedEvents,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.warn("Database offline, serving fallback events dataset:", error.message);
        const { q, type, mode, source, domain } = req.query;
        let filtered = [...fallbackData_1.FALLBACK_EVENTS];
        if (q) {
            const term = q.toLowerCase();
            filtered = filtered.filter((e) => e.title.toLowerCase().includes(term) || (e.description || "").toLowerCase().includes(term));
        }
        if (type && type !== "ALL") {
            filtered = filtered.filter((e) => e.eventType === type.toUpperCase());
        }
        if (mode && mode !== "ALL") {
            filtered = filtered.filter((e) => e.mode === mode.toUpperCase());
        }
        if (source && source !== "ALL") {
            filtered = filtered.filter((e) => e.source === source.toUpperCase());
        }
        res.json({
            events: filtered,
            pagination: {
                page: 1,
                limit: filtered.length,
                total: filtered.length,
                totalPages: 1,
            },
        });
    }
}
/**
 * GET /api/events/:id
 * Get single event with full details.
 */
async function getEvent(req, res) {
    try {
        const id = req.params.id;
        const event = await prisma_1.default.event.findUnique({
            where: { id },
            include: {
                organizer: {
                    select: { id: true, name: true, avatarUrl: true, bio: true },
                },
                institutions: {
                    include: {
                        institution: true,
                    },
                },
                _count: {
                    select: { bookmarks: true, views: true },
                },
            },
        });
        if (!event) {
            res.status(404).json({ error: "Event not found" });
            return;
        }
        // Record view
        if (req.user?.userId) {
            await prisma_1.default.eventView.create({
                data: { eventId: id, userId: req.user.userId },
            }).catch(() => { }); // Non-blocking
        }
        res.json({ event });
    }
    catch (error) {
        console.warn("Database offline, finding event in fallback dataset:", error.message);
        const fallbackEvent = fallbackData_1.FALLBACK_EVENTS.find((e) => e.id === req.params.id);
        if (fallbackEvent) {
            res.json({ event: fallbackEvent });
            return;
        }
        res.status(404).json({ error: "Event not found" });
    }
}
/**
 * POST /api/events
 * Create a new event (organizer only).
 */
async function createEvent(req, res) {
    try {
        const { title, description, eventType, mode, startDate, endDate, registrationDeadline, venueName, venueAddress, latitude, longitude, city, state, country, domains, requiredSkills, eligibility, registrationUrl, websiteUrl, bannerImageUrl, teamSizeMin, teamSizeMax, prizePool, institutionId, } = req.body;
        if (!title || !startDate) {
            res.status(400).json({ error: "Title and start date are required" });
            return;
        }
        const event = await prisma_1.default.event.create({
            data: {
                title,
                description,
                source: "ORGANIZER",
                eventType: eventType || "HACKATHON",
                mode: mode || "OFFLINE",
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
                venueName,
                venueAddress,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                city,
                state,
                country,
                domains: domains || [],
                requiredSkills: requiredSkills || [],
                eligibility,
                registrationUrl,
                websiteUrl,
                bannerImageUrl,
                teamSizeMin: teamSizeMin ? parseInt(teamSizeMin) : null,
                teamSizeMax: teamSizeMax ? parseInt(teamSizeMax) : null,
                prizePool,
                organizerId: req.user.userId,
            },
            include: {
                organizer: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
        });
        // Link to institution if provided
        if (institutionId) {
            await prisma_1.default.eventInstitution.create({
                data: { eventId: event.id, institutionId },
            }).catch(() => { });
        }
        res.status(201).json({ event });
    }
    catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ error: "Failed to create event" });
    }
}
/**
 * PUT /api/events/:id
 * Update an event (owner or admin only).
 */
async function updateEvent(req, res) {
    try {
        const id = req.params.id;
        // Check ownership
        const existing = await prisma_1.default.event.findUnique({
            where: { id },
            select: { organizerId: true },
        });
        if (!existing) {
            res.status(404).json({ error: "Event not found" });
            return;
        }
        if (existing.organizerId !== req.user.userId && req.user.role !== "ADMIN") {
            res.status(403).json({ error: "Not authorized to update this event" });
            return;
        }
        const updateData = { ...req.body };
        // Parse dates if provided
        if (updateData.startDate)
            updateData.startDate = new Date(updateData.startDate);
        if (updateData.endDate)
            updateData.endDate = new Date(updateData.endDate);
        if (updateData.registrationDeadline)
            updateData.registrationDeadline = new Date(updateData.registrationDeadline);
        if (updateData.latitude)
            updateData.latitude = parseFloat(updateData.latitude);
        if (updateData.longitude)
            updateData.longitude = parseFloat(updateData.longitude);
        if (updateData.teamSizeMin)
            updateData.teamSizeMin = parseInt(updateData.teamSizeMin);
        if (updateData.teamSizeMax)
            updateData.teamSizeMax = parseInt(updateData.teamSizeMax);
        // Remove fields that shouldn't be directly updated
        delete updateData.id;
        delete updateData.organizerId;
        delete updateData.source;
        delete updateData.institutionId;
        const event = await prisma_1.default.event.update({
            where: { id },
            data: updateData,
            include: {
                organizer: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
        });
        res.json({ event });
    }
    catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ error: "Failed to update event" });
    }
}
/**
 * DELETE /api/events/:id
 * Delete an event (owner or admin only).
 */
async function deleteEvent(req, res) {
    try {
        const id = req.params.id;
        const existing = await prisma_1.default.event.findUnique({
            where: { id },
            select: { organizerId: true },
        });
        if (!existing) {
            res.status(404).json({ error: "Event not found" });
            return;
        }
        if (existing.organizerId !== req.user.userId && req.user.role !== "ADMIN") {
            res.status(403).json({ error: "Not authorized to delete this event" });
            return;
        }
        await prisma_1.default.event.delete({ where: { id } });
        res.json({ message: "Event deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ error: "Failed to delete event" });
    }
}
/**
 * GET /api/events/organizer/mine
 * Get all events created by the authenticated organizer.
 */
async function getMyEvents(req, res) {
    try {
        const events = await prisma_1.default.event.findMany({
            where: { organizerId: req.user.userId },
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { bookmarks: true, views: true },
                },
            },
        });
        res.json({ events });
    }
    catch (error) {
        console.error("Error fetching organizer events:", error);
        res.status(500).json({ error: "Failed to fetch events" });
    }
}
// ─── Helper: Haversine Distance (km) ─────────────────
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function toRad(deg) {
    return deg * (Math.PI / 180);
}
//# sourceMappingURL=eventController.js.map