export declare class ScraperManager {
    private devpost;
    private unstop;
    /**
     * Run all scrapers and sync events into the database.
     */
    runAll(): Promise<{
        saved: number;
        skipped: number;
        errors: string[];
    }>;
}
export declare const scraperManager: ScraperManager;
//# sourceMappingURL=scraper-manager.d.ts.map