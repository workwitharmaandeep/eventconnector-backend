"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
function errorHandler(err, req, res, _next) {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
    if (process.env.NODE_ENV === "development") {
        console.error(err.stack);
    }
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? "Internal server error" : err.message;
    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
}
function notFoundHandler(req, res) {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
}
//# sourceMappingURL=errorHandler.js.map