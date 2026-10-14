import { Router } from "express";
import {
  registerUser,
  getProfile,
  updateProfile,
  checkUser,
} from "../controllers/userController";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Check if user is registered (called right after Firebase login on client)
router.get("/check", checkUser);

// Register user record in database
router.post("/register", registerUser);

// Profile management
router.get("/me", requireAuth, getProfile);
router.put("/me", requireAuth, updateProfile);

export default router;
