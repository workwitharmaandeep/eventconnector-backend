"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recommendationController_1 = require("../controllers/recommendationController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/", auth_1.requireAuth, recommendationController_1.getRecommendations);
exports.default = router;
//# sourceMappingURL=recommendations.js.map