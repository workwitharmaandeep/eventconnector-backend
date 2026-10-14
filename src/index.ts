import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cron from "node-cron";

import corsOptions from "./config/cors";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import eventsRouter from "./routes/events";
import institutionsRouter from "./routes/institutions";
import usersRouter from "./routes/users";
import bookmarksRouter from "./routes/bookmarks";
import recommendationsRouter from "./routes/recommendations";
import scrapersRouter from "./routes/scrapers";
import { scraperManager } from "./services/scrapers/scraper-manager";

const app = express();
const PORT = process.env.PORT || 5000;

// Security & utility middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors(corsOptions));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "EventConnector API",
    time: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Mount API routes
app.use("/api/events", eventsRouter);
app.use("/api/institutions", institutionsRouter);
app.use("/api/users", usersRouter);
app.use("/api/bookmarks", bookmarksRouter);
app.use("/api/recommendations", recommendationsRouter);
app.use("/api/scrapers", scrapersRouter);

// 404 & Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Scheduled Cron Job for Scrapers (e.g. daily at 06:00 AM)
if (process.env.SCRAPE_ENABLED !== "false") {
  const cronExpr = process.env.SCRAPE_CRON || "0 6 * * *";
  cron.schedule(cronExpr, async () => {
    console.log(`[CRON] Running scheduled scraper sync (${cronExpr})...`);
    try {
      await scraperManager.runAll();
    } catch (err) {
      console.error("[CRON] Scheduled scraper run failed:", err);
    }
  });
  console.log(`Automated event scrapers scheduled with expression: "${cronExpr}"`);
}

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 EventConnector Server running on http://localhost:${PORT}`);
  console.log(`📡 Client URL allowed: ${process.env.CLIENT_URL || "http://localhost:3000"}`);
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`=======================================================`);
});

export default app;
