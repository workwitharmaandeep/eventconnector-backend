"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const node_cron_1 = __importDefault(require("node-cron"));
const cors_2 = __importDefault(require("./config/cors"));
const errorHandler_1 = require("./middleware/errorHandler");
const events_1 = __importDefault(require("./routes/events"));
const institutions_1 = __importDefault(require("./routes/institutions"));
const users_1 = __importDefault(require("./routes/users"));
const bookmarks_1 = __importDefault(require("./routes/bookmarks"));
const recommendations_1 = __importDefault(require("./routes/recommendations"));
const scrapers_1 = __importDefault(require("./routes/scrapers"));
const scraper_manager_1 = require("./services/scrapers/scraper-manager");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security & utility middleware
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use((0, cors_1.default)(cors_2.default));
app.use((0, morgan_1.default)(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
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
app.use("/api/events", events_1.default);
app.use("/api/institutions", institutions_1.default);
app.use("/api/users", users_1.default);
app.use("/api/bookmarks", bookmarks_1.default);
app.use("/api/recommendations", recommendations_1.default);
app.use("/api/scrapers", scrapers_1.default);
// 404 & Error handlers
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
// Scheduled Cron Job for Scrapers (e.g. daily at 06:00 AM)
if (process.env.SCRAPE_ENABLED !== "false") {
    const cronExpr = process.env.SCRAPE_CRON || "0 6 * * *";
    node_cron_1.default.schedule(cronExpr, async () => {
        console.log(`[CRON] Running scheduled scraper sync (${cronExpr})...`);
        try {
            await scraper_manager_1.scraperManager.runAll();
        }
        catch (err) {
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
exports.default = app;
//# sourceMappingURL=index.js.map