import { ScrapedEventRaw } from "../../types";
export declare class UnstopScraper {
    name: string;
    /**
     * Scrapes upcoming student hackathons and competitions from Unstop.
     */
    scrape(): Promise<ScrapedEventRaw[]>;
    getFallbackEvents(): ScrapedEventRaw[];
}
//# sourceMappingURL=unstop-scraper.d.ts.map