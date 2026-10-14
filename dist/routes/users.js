"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Check if user is registered (called right after Firebase login on client)
router.get("/check", userController_1.checkUser);
// Register user record in database
router.post("/register", userController_1.registerUser);
// Profile management
router.get("/me", auth_1.requireAuth, userController_1.getProfile);
router.put("/me", auth_1.requireAuth, userController_1.updateProfile);
exports.default = router;
//# sourceMappingURL=users.js.map