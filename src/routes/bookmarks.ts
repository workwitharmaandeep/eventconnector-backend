import { Router } from "express";
import {
  toggleBookmark,
  getBookmarks,
  checkBookmark,
} from "../controllers/bookmarkController";
import { requireAuth } from "../middleware/auth";

const router = Router();

// All bookmark actions require authentication
router.use(requireAuth);

router.get("/", getBookmarks);
router.post("/toggle", toggleBookmark);
router.get("/check/:eventId", checkBookmark);

export default router;
