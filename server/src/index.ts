import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { connectDB, disconnectDB } from "./config/db";
import { connectRedis } from "./config/redis";
import routes from "./routes";
import { errorHandler, notFound } from "./middleware/errorHandler";

const app = express();

// ── Security & Parsing ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.isDev ? "dev" : "combined"));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", routes);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  await connectDB();
  await connectRedis().catch((err) => {
    console.warn("⚠️  Redis unavailable, running without cache:", err.message);
  });

  app.listen(env.PORT, () => {
    console.log(`\n🚀 JinkFi API running at http://localhost:${env.PORT}`);
    console.log(`   Env: ${env.NODE_ENV}`);
    console.log(`   Client: ${env.CLIENT_URL}\n`);
  });
}

start().catch((err) => {
  console.error("Startup error:", err);
  process.exit(1);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.on("SIGTERM", async () => {
  console.log("SIGTERM received — shutting down...");
  await disconnectDB();
  process.exit(0);
});
