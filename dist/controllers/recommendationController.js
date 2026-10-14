"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendations = getRecommendations;
const engine_1 = require("../services/recommendations/engine");
/**
 * GET /api/recommendations
 * Get personalized event recommendations for the authenticated user.
 */
async function getRecommendations(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }
        const limit = parseInt(req.query.limit) || 12;
        const recommendations = await engine_1.recommendationEngine.getRecommendations(userId, limit);
        res.json({
            recommendations,
            count: recommendations.length,
        });
    }
    catch (error) {
        console.error("Error generating recommendations:", error);
        res.status(500).json({ error: "Failed to generate recommendations" });
    }
}
//# sourceMappingURL=recommendationController.js.map