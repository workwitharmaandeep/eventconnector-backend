import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { firebaseAuth } from "../config/firebase-admin";

/**
 * POST /api/users/register
 * Register a new user after Firebase sign-up.
 * Expects Firebase ID token in Authorization header.
 */
export async function registerUser(req: Request, res: Response): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing authorization header" });
      return;
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await firebaseAuth.verifyIdToken(token);

    const { name, role = "STUDENT", skills, interests, preferredDomains, city, latitude, longitude } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    });

    if (existingUser) {
      res.status(409).json({ error: "User already registered", user: existingUser });
      return;
    }

    const user = await prisma.user.create({
      data: {
        email: decodedToken.email || "",
        firebaseUid: decodedToken.uid,
        name: name || decodedToken.name || "User",
        role: role === "ORGANIZER" ? "ORGANIZER" : "STUDENT",
        avatarUrl: decodedToken.picture || null,
        skills: skills || [],
        interests: interests || [],
        preferredDomains: preferredDomains || [],
        city,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
    });

    res.status(201).json({ user });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
}

/**
 * GET /api/users/me
 * Get the authenticated user's profile.
 */
export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        _count: {
          select: { events: true, bookmarks: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}

/**
 * PUT /api/users/me
 * Update the authenticated user's profile.
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const { name, bio, skills, interests, preferredDomains, city, latitude, longitude, avatarUrl } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (skills !== undefined) updateData.skills = skills;
    if (interests !== undefined) updateData.interests = interests;
    if (preferredDomains !== undefined) updateData.preferredDomains = preferredDomains;
    if (city !== undefined) updateData.city = city;
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: updateData,
    });

    res.json({ user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
}

/**
 * POST /api/users/check
 * Check if a Firebase user exists in our database.
 * Called after Firebase sign-in to determine if registration is needed.
 */
export async function checkUser(req: Request, res: Response): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing authorization header" });
      return;
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await firebaseAuth.verifyIdToken(token);

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    });

    res.json({ exists: !!user, user: user || null });
  } catch (error) {
    console.error("Error checking user:", error);
    res.status(500).json({ error: "Failed to check user" });
  }
}
