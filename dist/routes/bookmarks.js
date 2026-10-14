"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookmarkController_1 = require("../controllers/bookmarkController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All bookmark actions require authentication
router.use(auth_1.requireAuth);
router.get("/", bookmarkController_1.getBookmarks);
router.post("/toggle", bookmarkController_1.toggleBookmark);
router.get("/check/:eventId", bookmarkController_1.checkBookmark);
exports.default = router;
//# sourceMappingURL=bookmarks.js.map