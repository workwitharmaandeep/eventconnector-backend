"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scraper_manager_1 = require("../services/scrapers/scraper-manager");
const router = (0, express_1.Router)();
// Trigger sync manually
router.post("/sync", async (req, res) => {
    try {
        const result = await scraper_manager_1.scraperManager.runAll();
        res.json({
            success: true,
            message: "Scrapers completed successfully",
            data: result,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=scrapers.js.map