import { Request, Response } from "express";
import { recommendationEngine } from "../services/recommendations/engine";

/**
 * GET /api/recommendations
 * Get personalized event recommendations for the authenticated user.
 */
export async function getRecommendations(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 12;
    const recommendations = await recommendationEngine.getRecommendations(userId, limit);

    res.json({
      recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
}
