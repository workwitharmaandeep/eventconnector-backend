import { Router, Request, Response } from "express";
import { scraperManager } from "../services/scrapers/scraper-manager";

const router = Router();

// Trigger sync manually
router.post("/sync", async (req: Request, res: Response) => {
  try {
    const result = await scraperManager.runAll();
    res.json({
      success: true,
      message: "Scrapers completed successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
