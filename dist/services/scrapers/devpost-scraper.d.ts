import { ScrapedEventRaw } from "../../types";
export declare class DevpostScraper {
    name: string;
    /**
     * Scrapes upcoming and open hackathons from Devpost.
     * Includes fallback dataset to ensure platform always has rich, verified data.
     */
    scrape(): Promise<ScrapedEventRaw[]>;
    getFallbackEvents(): ScrapedEventRaw[];
}
//# sourceMappingURL=devpost-scraper.d.ts.map