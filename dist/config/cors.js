"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
exports.default = corsOptions;
//# sourceMappingURL=cors.js.map