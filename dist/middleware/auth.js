"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.optionalAuth = optionalAuth;
exports.requireOrganizer = requireOrganizer;
exports.requireAdmin = requireAdmin;
const firebase_admin_1 = require("../config/firebase-admin");
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * Middleware that verifies Firebase ID token from Authorization header.
 * Attaches decoded user info to req.user.
 * Returns 401 if token is missing or invalid.
 */
async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid authorization header" });
        return;
    }
    const token = authHeader.split("Bearer ")[1];
    try {
        const decodedToken = await firebase_admin_1.firebaseAuth.verifyIdToken(token);
        // Find user in our database
        const user = await prisma_1.default.user.findUnique({
            where: { firebaseUid: decodedToken.uid },
            select: { id: true, email: true, role: true, firebaseUid: true },
        });
        if (!user) {
            res.status(404).json({ error: "User not found. Please register first." });
            return;
        }
        req.user = {
            uid: decodedToken.uid,
            email: user.email,
            userId: user.id,
            role: user.role,
        };
        next();
    }
    catch (error) {
        console.error("Auth verification failed:", error);
        res.status(401).json({ error: "Invalid or expired token" });
        return;
    }
}
/**
 * Optional auth middleware - doesn't reject if no token,
 * but attaches user info if token is present.
 */
async function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }
    const token = authHeader.split("Bearer ")[1];
    try {
        const decodedToken = await firebase_admin_1.firebaseAuth.verifyIdToken(token);
        const user = await prisma_1.default.user.findUnique({
            where: { firebaseUid: decodedToken.uid },
            select: { id: true, email: true, role: true, firebaseUid: true },
        });
        if (user) {
            req.user = {
                uid: decodedToken.uid,
                email: user.email,
                userId: user.id,
                role: user.role,
            };
        }
    }
    catch {
        // Silently continue without auth
    }
    next();
}
/**
 * Middleware that checks if the authenticated user has the ORGANIZER role.
 * Must be used after requireAuth.
 */
function requireOrganizer(req, res, next) {
    if (!req.user || (req.user.role !== "ORGANIZER" && req.user.role !== "ADMIN")) {
        res.status(403).json({ error: "Organizer access required" });
        return;
    }
    next();
}
/**
 * Middleware that checks if the authenticated user has the ADMIN role.
 * Must be used after requireAuth.
 */
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== "ADMIN") {
        res.status(403).json({ error: "Admin access required" });
        return;
    }
    next();
}
//# sourceMappingURL=auth.js.map