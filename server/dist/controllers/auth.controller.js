"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNonce = getNonce;
exports.verifySignature = verifySignature;
exports.getMe = getMe;
const siwe_1 = require("siwe");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const redis_1 = require("../config/redis");
const env_1 = require("../config/env");
const errorHandler_1 = require("../middleware/errorHandler");
const zod_1 = require("zod");
// GET /api/auth/nonce/:address
async function getNonce(req, res) {
    const address = String(req.params.address).toLowerCase();
    let user = await db_1.prisma.user.findUnique({ where: { address } });
    if (!user) {
        user = await db_1.prisma.user.create({ data: { address } });
    }
    else {
        // Rotate nonce every request
        user = await db_1.prisma.user.update({
            where: { address },
            data: { nonce: crypto.randomUUID() },
        });
    }
    // Cache nonce for 5 minutes
    await (0, redis_1.cacheSet)(redis_1.CacheKeys.nonce(address), user.nonce, 300);
    res.json({ nonce: user.nonce });
}
const verifySchema = zod_1.z.object({
    message: zod_1.z.string(),
    signature: zod_1.z.string(),
});
// POST /api/auth/verify
async function verifySignature(req, res) {
    const { message, signature } = verifySchema.parse(req.body);
    const siweMessage = new siwe_1.SiweMessage(message);
    const result = await siweMessage.verify({ signature });
    if (!result.success) {
        throw new errorHandler_1.AppError(401, "Invalid signature");
    }
    const address = siweMessage.address.toLowerCase();
    const cachedNonce = await (0, redis_1.cacheGet)(redis_1.CacheKeys.nonce(address));
    if (cachedNonce && siweMessage.nonce !== cachedNonce) {
        throw new errorHandler_1.AppError(401, "Invalid nonce");
    }
    let user = await db_1.prisma.user.findUnique({ where: { address } });
    if (!user) {
        user = await db_1.prisma.user.create({ data: { address } });
    }
    // Invalidate nonce after use
    await (0, redis_1.cacheDel)(redis_1.CacheKeys.nonce(address));
    // Rotate stored nonce
    await db_1.prisma.user.update({ where: { address }, data: { nonce: crypto.randomUUID() } });
    const token = jsonwebtoken_1.default.sign({ id: user.id, address: user.address }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
    res.json({ token, user: { id: user.id, address: user.address, username: user.username } });
}
// GET /api/auth/me
async function getMe(req, res) {
    const user = await db_1.prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, address: true, username: true, createdAt: true },
    });
    res.json({ user });
}
//# sourceMappingURL=auth.controller.js.map