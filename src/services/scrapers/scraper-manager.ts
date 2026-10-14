import prisma from "../../lib/prisma";
import { DevpostScraper } from "./devpost-scraper";
import { UnstopScraper } from "./unstop-scraper";
import { ScrapedEventRaw } from "../../types";

export class ScraperManager {
  private devpost = new DevpostScraper();
  private unstop = new UnstopScraper();

  /**
   * Run all scrapers and sync events into the database.
   */
  async runAll(): Promise<{ saved: number; skipped: number; errors: string[] }> {
    console.log("Starting full scraper run (Devpost + Unstop)...");
    const errors: string[] = [];
    let saved = 0;
    let skipped = 0;

    let allScraped: ScrapedEventRaw[] = [];

    // Devpost
    try {
      const devpostEvents = await this.devpost.scrape();
      allScraped = allScraped.concat(devpostEvents);
      console.log(`Fetched ${devpostEvents.length} events from Devpost`);
    } catch (err: any) {
      console.error("Devpost scraper failed:", err);
      errors.push(`Devpost error: ${err.message}`);
    }

    // Unstop
    try {
      const unstopEvents = await this.unstop.scrape();
      allScraped = allScraped.concat(unstopEvents);
      console.log(`Fetched ${unstopEvents.length} events from Unstop`);
    } catch (err: any) {
      console.error("Unstop scraper failed:", err);
      errors.push(`Unstop error: ${err.message}`);
    }

    // Persist to database without creating duplicates
    for (const item of allScraped) {
      try {
        const existing = await prisma.event.findFirst({
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

        await prisma.event.create({
          data: {
            title: item.title,
            description: item.description,
            source: item.source as any,
            externalUrl: item.externalUrl,
            externalPlatform: item.externalPlatform,
            eventType: item.eventType as any,
            mode: item.mode as any,
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
      } catch (err: any) {
        console.error(`Failed to save event "${item.title}":`, err.message);
        errors.push(`Save error for "${item.title}": ${err.message}`);
      }
    }

    console.log(`Scraper completed. Saved: ${saved}, Skipped: ${skipped}, Errors: ${errors.length}`);
    return { saved, skipped, errors };
  }
}

export const scraperManager = new ScraperManager();
