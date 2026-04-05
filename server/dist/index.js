"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const redis_1 = require("./config/redis");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// ── Security & Parsing ────────────────────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));
app.use(express_1.default.json({ limit: "10kb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)(env_1.env.isDev ? "dev" : "combined"));
// ── Rate limiting ─────────────────────────────────────────────────────────────
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later" },
});
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many auth attempts, please try again later" },
});
app.use("/api", apiLimiter);
app.use("/api/auth/nonce", authLimiter);
app.use("/api/auth/verify", authLimiter);
// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", routes_1.default);
// ── Error handling ────────────────────────────────────────────────────────────
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
    await (0, db_1.connectDB)();
    await (0, redis_1.connectRedis)().catch((err) => {
        console.warn("⚠️  Redis unavailable, running without cache:", err.message);
    });
    app.listen(env_1.env.PORT, () => {
        console.log(`\n🚀 JinkFi API running at http://localhost:${env_1.env.PORT}`);
        console.log(`   Env: ${env_1.env.NODE_ENV}`);
        console.log(`   Client: ${env_1.env.CLIENT_URL}\n`);
    });
}
start().catch((err) => {
    console.error("Startup error:", err);
    process.exit(1);
});
// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.on("SIGTERM", async () => {
    console.log("SIGTERM received — shutting down...");
    await (0, db_1.disconnectDB)();
    process.exit(0);
});
//# sourceMappingURL=index.js.map