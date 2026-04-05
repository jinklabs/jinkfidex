import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  NODE_ENV: optional("NODE_ENV", "development"),
  PORT: parseInt(optional("PORT", "4000")),
  DATABASE_URL: required("DATABASE_URL"),
  REDIS_URL: optional("REDIS_URL", "redis://localhost:6379"),
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: optional("JWT_EXPIRES_IN", "7d"),
  CLIENT_URL: optional("CLIENT_URL", "http://localhost:5173"),
  CACHE_TTL_SHORT: parseInt(optional("CACHE_TTL_SHORT", "60")),
  CACHE_TTL_MEDIUM: parseInt(optional("CACHE_TTL_MEDIUM", "300")),
  CACHE_TTL_LONG: parseInt(optional("CACHE_TTL_LONG", "3600")),
  // RPC for on-chain task verification
  MAINNET_RPC_URL: optional("MAINNET_RPC_URL", "https://cloudflare-eth.com"),
  BASE_RPC_URL:    optional("BASE_RPC_URL",    "https://mainnet.base.org"),
  TEMPO_RPC_URL:   optional("TEMPO_RPC_URL",   "https://rpc.tempo.xyz"),
  // Optional social verification
  TWITTER_BEARER_TOKEN: optional("TWITTER_BEARER_TOKEN", ""),
  DISCORD_BOT_TOKEN:    optional("DISCORD_BOT_TOKEN",    ""),
  // Quest submission fee
  QUEST_FEE_ETH:         optional("QUEST_FEE_ETH",         "0.05"),
  FEE_RECIPIENT_ADDRESS: optional("FEE_RECIPIENT_ADDRESS", ""),
  // Admin wallet addresses (comma-separated, lowercase)
  ADMIN_ADDRESSES:       optional("ADMIN_ADDRESSES",       ""),
  isDev: optional("NODE_ENV", "development") === "development",
};
