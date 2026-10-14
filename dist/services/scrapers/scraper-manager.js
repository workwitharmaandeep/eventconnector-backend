"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scraperManager = exports.ScraperManager = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const devpost_scraper_1 = require("./devpost-scraper");
const unstop_scraper_1 = require("./unstop-scraper");
class ScraperManager {
    devpost = new devpost_scraper_1.DevpostScraper();
    unstop = new unstop_scraper_1.UnstopScraper();
    /**
     * Run all scrapers and sync events into the database.
     */
    async runAll() {
        console.log("Starting full scraper run (Devpost + Unstop)...");
        const errors = [];
        let saved = 0;
        let skipped = 0;
        let allScraped = [];
        // Devpost
        try {
            const devpostEvents = await this.devpost.scrape();
            allScraped = allScraped.concat(devpostEvents);
            console.log(`Fetched ${devpostEvents.length} events from Devpost`);
        }
        catch (err) {
            console.error("Devpost scraper failed:", err);
            errors.push(`Devpost error: ${err.message}`);
        }
        // Unstop
        try {
            const unstopEvents = await this.unstop.scrape();
            allScraped = allScraped.concat(unstopEvents);
            console.log(`Fetched ${unstopEvents.length} events from Unstop`);
        }
        catch (err) {
            console.error("Unstop scraper failed:", err);
            errors.push(`Unstop error: ${err.message}`);
        }
        // Persist to database without creating duplicates
        for (const item of allScraped) {
            try {
                const existing = await prisma_1.default.event.findFirst({
                    where: {
                        OR: [
                            { externalUrl: item.externalUrl },
                            { title: item.title },
                        ],
                    },
                });
                if (existing) {
                    skipped++;
                    continue;
                }
                await prisma_1.default.event.create({
                    data: {
                        title: item.title,
                        description: item.description,
                        source: item.source,
                        externalUrl: item.externalUrl,
                        externalPlatform: item.externalPlatform,
                        eventType: item.eventType,
                        mode: item.mode,
                        startDate: item.startDate,
                        endDate: item.endDate,
                        registrationDeadline: item.registrationDeadline,
                        venueName: item.venueName,
                        venueAddress: item.venueAddress,
                        latitude: item.latitude,
                        longitude: item.longitude,
                        city: item.city,
                        state: item.state,
                        country: item.country,
                        domains: item.domains,
                        requiredSkills: item.requiredSkills,
                        registrationUrl: item.registrationUrl,
                        websiteUrl: item.websiteUrl,
                        bannerImageUrl: item.bannerImageUrl,
                        teamSizeMin: item.teamSizeMin,
                        teamSizeMax: item.teamSizeMax,
                        prizePool: item.prizePool,
                        isFeatured: false,
                        isApproved: true,
                    },
                });
                saved++;
            }
            catch (err) {
                console.error(`Failed to save event "${item.title}":`, err.message);
                errors.push(`Save error for "${item.title}": ${err.message}`);
            }
        }
        console.log(`Scraper completed. Saved: ${saved}, Skipped: ${skipped}, Errors: ${errors.length}`);
        return { saved, skipped, errors };
    }
}
exports.ScraperManager = ScraperManager;
exports.scraperManager = new ScraperManager();
//# sourceMappingURL=scraper-manager.js.map