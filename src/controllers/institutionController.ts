import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { FALLBACK_INSTITUTIONS } from "../lib/fallbackData";

/**
 * GET /api/institutions
 * List all institutions with optional search.
 */
export async function listInstitutions(req: Request, res: Response): Promise<void> {
  try {
    const { q, city, state, page = "1", limit = "20" } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (q) {
      where.OR = [
        { name: { contains: q as string, mode: "insensitive" } },
        { address: { contains: q as string, mode: "insensitive" } },
      ];
    }
    if (city) where.city = { contains: city as string, mode: "insensitive" };
    if (state) where.state = { contains: state as string, mode: "insensitive" };

    const [institutions, total] = await Promise.all([
      prisma.institution.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { name: "asc" },
        include: {
          _count: { select: { events: true } },
          createdBy: { select: { id: true, name: true } },
        },
      }),
      prisma.institution.count({ where }),
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
  } catch (error) {
    console.warn("Database offline, serving fallback institutions dataset");
    res.json({
      institutions: FALLBACK_INSTITUTIONS,
      pagination: {
        page: 1,
        limit: FALLBACK_INSTITUTIONS.length,
        total: FALLBACK_INSTITUTIONS.length,
        totalPages: 1,
      },
    });
  }
}

/**
 * GET /api/institutions/:id
 * Get single institution with campus map data and linked events.
 */
export async function getInstitution(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    const institution = await prisma.institution.findUnique({
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
  } catch (error) {
    console.warn("Database offline, finding institution in fallback dataset");
    const inst = FALLBACK_INSTITUTIONS.find((i) => i.id === req.params.id);
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
export async function createInstitution(req: Request, res: Response): Promise<void> {
  try {
    const {
      name, address, latitude, longitude, city, state, country,
      websiteUrl, campusMapImageUrl, campusMapMarkers,
    } = req.body;

    if (!name || latitude === undefined || longitude === undefined) {
      res.status(400).json({ error: "Name, latitude, and longitude are required" });
      return;
    }

    const institution = await prisma.institution.create({
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
        createdById: req.user!.userId,
      },
    });

    res.status(201).json({ institution });
  } catch (error) {
    console.error("Error creating institution:", error);
    res.status(500).json({ error: "Failed to create institution" });
  }
}

/**
 * PUT /api/institutions/:id
 * Update an institution (creator or admin only).
 */
export async function updateInstitution(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    const existing = await prisma.institution.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!existing) {
      res.status(404).json({ error: "Institution not found" });
      return;
    }

    if (existing.createdById !== req.user!.userId && req.user!.role !== "ADMIN") {
      res.status(403).json({ error: "Not authorized to update this institution" });
      return;
    }

    const updateData: any = { ...req.body };
    if (updateData.latitude) updateData.latitude = parseFloat(updateData.latitude);
    if (updateData.longitude) updateData.longitude = parseFloat(updateData.longitude);
    delete updateData.id;
    delete updateData.createdById;

    const institution = await prisma.institution.update({
      where: { id },
      data: updateData,
    });

    res.json({ institution });
  } catch (error) {
    console.error("Error updating institution:", error);
    res.status(500).json({ error: "Failed to update institution" });
  }
}
