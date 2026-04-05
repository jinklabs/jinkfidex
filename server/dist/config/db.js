"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const env_1 = require("./env");
const globalForPrisma = globalThis;
function createPrisma() {
    const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
    return new client_1.PrismaClient({
        adapter,
        log: env_1.env.isDev ? ["query", "error", "warn"] : ["error"],
    });
}
exports.prisma = globalForPrisma.prisma ?? createPrisma();
if (env_1.env.isDev)
    globalForPrisma.prisma = exports.prisma;
async function connectDB() {
    try {
        await exports.prisma.$connect();
        console.log("✅ PostgreSQL connected");
    }
    catch (err) {
        console.error("❌ PostgreSQL connection failed:", err);
        process.exit(1);
    }
}
async function disconnectDB() {
    await exports.prisma.$disconnect();
}
//# sourceMappingURL=db.js.map