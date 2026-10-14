"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listInstitutions = listInstitutions;
exports.getInstitution = getInstitution;
exports.createInstitution = createInstitution;
exports.updateInstitution = updateInstitution;
const prisma_1 = __importDefault(require("../lib/prisma"));
const fallbackData_1 = require("../lib/fallbackData");
/**
 * GET /api/institutions
 * List all institutions with optional search.
 */
async function listInstitutions(req, res) {
    try {
        const { q, city, state, page = "1", limit = "20" } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (q) {
            where.OR = [
                { name: { contains: q, mode: "insensitive" } },
                { address: { contains: q, mode: "insensitive" } },
            ];
        }
        if (city)
            where.city = { contains: city, mode: "insensitive" };
        if (state)
            where.state = { contains: state, mode: "insensitive" };
        const [institutions, total] = await Promise.all([
            prisma_1.default.institution.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { name: "asc" },
                include: {
                    _count: { select: { events: true } },
                    createdBy: { select: { id: true, name: true } },
                },
            }),
            prisma_1.default.institution.count({ where }),
        ]);
        res.json({
            institutions,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.warn("Database offline, serving fallback institutions dataset");
        res.json({
            institutions: fallbackData_1.FALLBACK_INSTITUTIONS,
            pagination: {
                page: 1,
                limit: fallbackData_1.FALLBACK_INSTITUTIONS.length,
                total: fallbackData_1.FALLBACK_INSTITUTIONS.length,
                totalPages: 1,
            },
        });
    }
}
/**
 * GET /api/institutions/:id
 * Get single institution with campus map data and linked events.
 */
async function getInstitution(req, res) {
    try {
        const id = req.params.id;
        const institution = await prisma_1.default.institution.findUnique({
            where: { id },
            include: {
                events: {
                    include: {
                        event: {
                            select: {
                                id: true, title: true, eventType: true, startDate: true,
                                endDate: true, mode: true, source: true, bannerImageUrl: true,
                            },
                        },
                    },
                },
                createdBy: { select: { id: true, name: true, avatarUrl: true } },
            },
        });
        if (!institution) {
            res.status(404).json({ error: "Institution not found" });
            return;
        }
        res.json({ institution });
    }
    catch (error) {
        console.warn("Database offline, finding institution in fallback dataset");
        const inst = fallbackData_1.FALLBACK_INSTITUTIONS.find((i) => i.id === req.params.id);
        if (inst) {
            res.json({ institution: inst });
            return;
        }
        res.status(404).json({ error: "Institution not found" });
    }
}
/**
 * POST /api/institutions
 * Create a new institution (organizer only).
 */
async function createInstitution(req, res) {
    try {
        const { name, address, latitude, longitude, city, state, country, websiteUrl, campusMapImageUrl, campusMapMarkers, } = req.body;
        if (!name || latitude === undefined || longitude === undefined) {
            res.status(400).json({ error: "Name, latitude, and longitude are required" });
            return;
        }
        const institution = await prisma_1.default.institution.create({
            data: {
                name,
                address,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                city,
                state,
                country,
                websiteUrl,
                campusMapImageUrl,
                campusMapMarkers: campusMapMarkers || null,
                createdById: req.user.userId,
            },
        });
        res.status(201).json({ institution });
    }
    catch (error) {
        console.error("Error creating institution:", error);
        res.status(500).json({ error: "Failed to create institution" });
    }
}
/**
 * PUT /api/institutions/:id
 * Update an institution (creator or admin only).
 */
async function updateInstitution(req, res) {
    try {
        const id = req.params.id;
        const existing = await prisma_1.default.institution.findUnique({
            where: { id },
            select: { createdById: true },
        });
        if (!existing) {
            res.status(404).json({ error: "Institution not found" });
            return;
        }
        if (existing.createdById !== req.user.userId && req.user.role !== "ADMIN") {
            res.status(403).json({ error: "Not authorized to update this institution" });
            return;
        }
        const updateData = { ...req.body };
        if (updateData.latitude)
            updateData.latitude = parseFloat(updateData.latitude);
        if (updateData.longitude)
            updateData.longitude = parseFloat(updateData.longitude);
        delete updateData.id;
        delete updateData.createdById;
        const institution = await prisma_1.default.institution.update({
            where: { id },
            data: updateData,
        });
        res.json({ institution });
    }
    catch (error) {
        console.error("Error updating institution:", error);
        res.status(500).json({ error: "Failed to update institution" });
    }
}
//# sourceMappingURL=institutionController.js.map