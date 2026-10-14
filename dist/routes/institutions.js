"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const institutionController_1 = require("../controllers/institutionController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get("/", institutionController_1.listInstitutions);
router.get("/:id", institutionController_1.getInstitution);
// Protected routes (Organizers / Admins can create or update institutions with campus map details)
router.post("/", auth_1.requireAuth, auth_1.requireOrganizer, institutionController_1.createInstitution);
router.put("/:id", auth_1.requireAuth, auth_1.requireOrganizer, institutionController_1.updateInstitution);
exports.default = router;
//# sourceMappingURL=institutions.js.map