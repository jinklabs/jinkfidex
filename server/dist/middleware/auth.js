"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
exports.optionalAuth = optionalAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const db_1 = require("../config/db");
async function requireAuth(req, res, next) {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            res.status(401).json({ error: "No token provided" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        const user = await db_1.prisma.user.findUnique({ where: { address: decoded.address.toLowerCase() } });
        if (!user) {
            res.status(401).json({ error: "User not found" });
            return;
        }
        req.user = { id: user.id, address: user.address };
        next();
    }
    catch {
        res.status(401).json({ error: "Invalid token" });
    }
}
async function requireAdmin(req, res, next) {
    await requireAuth(req, res, () => {
        const admins = env_1.env.ADMIN_ADDRESSES.split(",").map(a => a.trim().toLowerCase()).filter(Boolean);
        if (!admins.includes(req.user.address.toLowerCase())) {
            res.status(403).json({ error: "Admin access required" });
            return;
        }
        next();
    });
}
function optionalAuth(req, res, next) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
        next();
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.user = { id: decoded.id, address: decoded.address };
    }
    catch { /* ignore */ }
    next();
}
//# sourceMappingURL=auth.js.map