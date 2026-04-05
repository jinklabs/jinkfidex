import { defineChain, http } from "viem";
import { sepolia } from "viem/chains";
import { createConfig } from "@privy-io/wagmi";
import { QueryClient } from "@tanstack/react-query";

// ── Custom chains ─────────────────────────────────────────────────────────────

export const tempoMainnet = defineChain({
  id: 4217,
  name: "Tempo",
  nativeCurrency: { name: "USD", symbol: "USD", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.tempo.xyz"] },
  },
  blockExplorers: {
    default: { name: "Tempo Explorer", url: "https://explore.mainnet.tempo.xyz" },
  },
});

// ── Supported chains ──────────────────────────────────────────────────────────

export const supportedChains = [tempoMainnet, sepolia] as const;

// ── QueryClient ───────────────────────────────────────────────────────────────

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

// ── Wagmi config ──────────────────────────────────────────────────────────────

export const wagmiConfig = createConfig({
  chains: [tempoMainnet, sepolia],
  transports: {
    [tempoMainnet.id]: http("https://rpc.tempo.xyz"),
    [sepolia.id]:      http(),
  },
});
