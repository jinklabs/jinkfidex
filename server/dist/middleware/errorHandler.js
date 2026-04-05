"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
exports.notFound = notFound;
const env_1 = require("../config/env");
const zod_1 = require("zod");
class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AppError";
    }
}
exports.AppError = AppError;
function errorHandler(err, req, res, _next) {
    console.error(`[${req.method}] ${req.path} —`, err.message);
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            error: "Validation error",
            details: err.issues.map((e) => ({ field: e.path.map(String).join("."), message: e.message })),
        });
        return;
    }
    res.status(500).json({
        error: env_1.env.isDev ? err.message : "Internal server error",
        ...(env_1.env.isDev && { stack: err.stack }),
    });
}
function notFound(req, res) {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
}
//# sourceMappingURL=errorHandler.js.map