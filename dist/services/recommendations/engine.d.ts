/**
 * TF-IDF-inspired recommendation engine that matches user profiles
 * to events based on skills, interests, domains, and geographic proximity.
 */
export declare class RecommendationEngine {
    /**
     * Get personalized event recommendations for a user.
     */
    getRecommendations(userId: string, limit?: number): Promise<any[]>;
    /**
     * Score a single event against a user's profile.
     */
    private scoreEvent;
    /**
     * Compute TF-IDF cosine similarity between two term vectors.
     */
    private computeTfIdfSimilarity;
    /**
     * Simple overlap ratio between two term arrays.
     */
    private computeOverlap;
    /**
     * Compute document frequency for all terms across events.
     */
    private computeDocumentFrequency;
    /**
     * Haversine distance in km between two lat/lng points.
     */
    private haversineDistance;
}
export declare const recommendationEngine: RecommendationEngine;
//# sourceMappingURL=engine.d.ts.map