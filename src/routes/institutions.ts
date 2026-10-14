import { Router } from "express";
import {
  listInstitutions,
  getInstitution,
  createInstitution,
  updateInstitution,
} from "../controllers/institutionController";
import { requireAuth, requireOrganizer } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/", listInstitutions);
router.get("/:id", getInstitution);

// Protected routes (Organizers / Admins can create or update institutions with campus map details)
router.post("/", requireAuth, requireOrganizer, createInstitution);
router.put("/:id", requireAuth, requireOrganizer, updateInstitution);

export default router;
