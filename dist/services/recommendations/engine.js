"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationEngine = exports.RecommendationEngine = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
/**
 * TF-IDF-inspired recommendation engine that matches user profiles
 * to events based on skills, interests, domains, and geographic proximity.
 */
class RecommendationEngine {
    /**
     * Get personalized event recommendations for a user.
     */
    async getRecommendations(userId, limit = 20) {
        // Fetch user profile
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                skills: true,
                interests: true,
                preferredDomains: true,
                latitude: true,
                longitude: true,
            },
        });
        if (!user)
            return [];
        // Fetch active, upcoming events
        const events = await prisma_1.default.event.findMany({
            where: {
                isApproved: true,
                startDate: { gte: new Date() },
            },
            include: {
                organizer: {
                    select: { id: true, name: true, avatarUrl: true },
                },
                _count: {
                    select: { bookmarks: true, views: true },
                },
            },
            take: 200, // Cap for performance
            orderBy: { startDate: "asc" },
        });
        // Fetch user's already bookmarked events to exclude
        const bookmarkedIds = new Set((await prisma_1.default.bookmark.findMany({
            where: { userId },
            select: { eventId: true },
        })).map((b) => b.eventId));
        // Compute document frequency for IDF weighting
        const termDocFreq = this.computeDocumentFrequency(events);
        const totalDocs = events.length;
        // Score each event
        const scoredEvents = events
            .filter((event) => !bookmarkedIds.has(event.id))
            .map((event) => this.scoreEvent(user, event, termDocFreq, totalDocs));
        // Sort by score descending
        scoredEvents.sort((a, b) => b.score - a.score);
        // Return top N with full event data
        const topEventIds = scoredEvents.slice(0, limit).map((s) => s.eventId);
        const topScores = new Map(scoredEvents.slice(0, limit).map((s) => [s.eventId, s]));
        const recommendedEvents = events
            .filter((e) => topEventIds.includes(e.id))
            .map((e) => ({
            ...e,
            recommendationScore: topScores.get(e.id)?.score || 0,
            recommendationReasons: topScores.get(e.id)?.reasons || [],
        }))
            .sort((a, b) => b.recommendationScore - a.recommendationScore);
        return recommendedEvents;
    }
    /**
     * Score a single event against a user's profile.
     */
    scoreEvent(user, event, docFreq, totalDocs) {
        let score = 0;
        const reasons = [];
        // 1. Skill match (highest weight)
        const skillMatch = this.computeTfIdfSimilarity(user.skills, event.requiredSkills || [], docFreq, totalDocs);
        if (skillMatch > 0) {
            score += skillMatch * 40; // Weight: 40%
            const matched = user.skills.filter((s) => event.requiredSkills.some((es) => es.toLowerCase() === s.toLowerCase()));
            if (matched.length > 0)
                reasons.push(`Skills match: ${matched.join(", ")}`);
        }
        // 2. Domain match (high weight)
        const domainMatch = this.computeTfIdfSimilarity(user.preferredDomains, event.domains || [], docFreq, totalDocs);
        if (domainMatch > 0) {
            score += domainMatch * 30; // Weight: 30%
            const matched = user.preferredDomains.filter((d) => event.domains.some((ed) => ed.toLowerCase() === d.toLowerCase()));
            if (matched.length > 0)
                reasons.push(`Domain match: ${matched.join(", ")}`);
        }
        // 3. Interest match (moderate weight)
        const interestTerms = [...(event.domains || []), ...(event.requiredSkills || [])];
        const interestMatch = this.computeOverlap(user.interests, interestTerms);
        if (interestMatch > 0) {
            score += interestMatch * 20; // Weight: 20%
            reasons.push("Matches your interests");
        }
        // 4. Geographic proximity boost (10% weight)
        if (user.latitude && user.longitude && event.latitude && event.longitude) {
            const distance = this.haversineDistance(user.latitude, user.longitude, event.latitude, event.longitude);
            // Closer events get higher score: max boost at 0km, zero boost at 500km+
            const geoScore = Math.max(0, 1 - distance / 500);
            if (geoScore > 0) {
                score += geoScore * 10;
                if (distance < 50)
                    reasons.push(`Nearby (${Math.round(distance)}km away)`);
            }
        }
        // 5. Recency boost (small bonus for events starting sooner)
        const daysUntilStart = Math.max(0, (new Date(event.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntilStart <= 30) {
            score += (1 - daysUntilStart / 30) * 5;
            if (daysUntilStart <= 7)
                reasons.push("Starting soon!");
        }
        // 6. Popularity boost
        const popularity = (event._count?.views || 0) + (event._count?.bookmarks || 0) * 2;
        score += Math.min(5, popularity / 20);
        return { eventId: event.id, score, reasons };
    }
    /**
     * Compute TF-IDF cosine similarity between two term vectors.
     */
    computeTfIdfSimilarity(userTerms, eventTerms, docFreq, totalDocs) {
        if (userTerms.length === 0 || eventTerms.length === 0)
            return 0;
        const normalize = (s) => s.toLowerCase().trim();
        const userNorm = userTerms.map(normalize);
        const eventNorm = eventTerms.map(normalize);
        // Build TF vectors
        const allTerms = new Set([...userNorm, ...eventNorm]);
        let dotProduct = 0;
        let userMag = 0;
        let eventMag = 0;
        for (const term of allTerms) {
            const userTf = userNorm.filter((t) => t === term).length / userNorm.length;
            const eventTf = eventNorm.filter((t) => t === term).length / eventNorm.length;
            // IDF: log(N / df), capped
            const df = docFreq.get(term) || 1;
            const idf = Math.log(totalDocs / df);
            const userTfIdf = userTf * idf;
            const eventTfIdf = eventTf * idf;
            dotProduct += userTfIdf * eventTfIdf;
            userMag += userTfIdf * userTfIdf;
            eventMag += eventTfIdf * eventTfIdf;
        }
        const magnitude = Math.sqrt(userMag) * Math.sqrt(eventMag);
        return magnitude === 0 ? 0 : dotProduct / magnitude;
    }
    /**
     * Simple overlap ratio between two term arrays.
     */
    computeOverlap(terms1, terms2) {
        if (terms1.length === 0 || terms2.length === 0)
            return 0;
        const set1 = new Set(terms1.map((t) => t.toLowerCase()));
        const set2 = new Set(terms2.map((t) => t.toLowerCase()));
        let overlap = 0;
        for (const term of set1) {
            if (set2.has(term))
                overlap++;
        }
        return overlap / Math.max(set1.size, set2.size);
    }
    /**
     * Compute document frequency for all terms across events.
     */
    computeDocumentFrequency(events) {
        const freq = new Map();
        for (const event of events) {
            const terms = new Set([
                ...(event.domains || []).map((d) => d.toLowerCase()),
                ...(event.requiredSkills || []).map((s) => s.toLowerCase()),
            ]);
            for (const term of terms) {
                freq.set(term, (freq.get(term) || 0) + 1);
            }
        }
        return freq;
    }
    /**
     * Haversine distance in km between two lat/lng points.
     */
    haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
exports.RecommendationEngine = RecommendationEngine;
exports.recommendationEngine = new RecommendationEngine();
//# sourceMappingURL=engine.js.map