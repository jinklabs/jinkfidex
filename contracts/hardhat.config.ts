import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY ?? "";
const BASESCAN_API_KEY  = process.env.BASESCAN_API_KEY  ?? "";

if (!PRIVATE_KEY && process.env.HARDHAT_TASK !== "node") {
  console.warn("[warn] PRIVATE_KEY not set in .env — deployment will fail.");
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },

  networks: {
    // ── Local ─────────────────────────────────────────────────────────────────
    localhost: {
      url: "http://127.0.0.1:8545",
    },

    // ── Ethereum Mainnet ──────────────────────────────────────────────────────
    mainnet: {
      url:      process.env.MAINNET_RPC_URL ?? "https://cloudflare-eth.com",
      chainId:  1,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },

    // ── Base ──────────────────────────────────────────────────────────────────
    base: {
      url:      process.env.BASE_RPC_URL ?? "https://mainnet.base.org",
      chainId:  8453,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },

    // ── Arbitrum ──────────────────────────────────────────────────────────────
    arbitrum: {
      url:      process.env.ARBITRUM_RPC_URL ?? "https://arb1.arbitrum.io/rpc",
      chainId:  42161,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },

    // ── Monad Testnet ─────────────────────────────────────────────────────────
    monad: {
      url:      process.env.MONAD_RPC_URL ?? "https://testnet-rpc.monad.xyz",
      chainId:  10143,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },

    // ── Tempo Mainnet ─────────────────────────────────────────────────────────
    tempo: {
      url:      process.env.TEMPO_RPC_URL ?? "https://rpc.tempo.xyz",
      chainId:  4217,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },

    // ── HyperEVM ──────────────────────────────────────────────────────────────
    hyperevm: {
      url:      process.env.HYPEREVM_RPC_URL ?? "https://api.hyperliquid.xyz/evm",
      chainId:  999,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },

    // ── Sepolia (testnet) ─────────────────────────────────────────────────────
    sepolia: {
      url:      process.env.SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com",
      chainId:  11155111,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },

    // ── Base Sepolia (testnet) ────────────────────────────────────────────────
    baseSepolia: {
      url:      process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org",
      chainId:  84532,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },

  etherscan: {
    // Etherscan V2: single API key works across all EVM chains
    apiKey: ETHERSCAN_API_KEY,
    customChains: [
      {
        network:    "base",
        chainId:    8453,
        urls: {
          apiURL:     "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
      {
        network:    "baseSepolia",
        chainId:    84532,
        urls: {
          apiURL:     "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
      {
        network:    "monad",
        chainId:    10143,
        urls: {
          apiURL:     "https://testnet.monadexplorer.com/api",
          browserURL: "https://testnet.monadexplorer.com",
        },
      },
      {
        network:    "hyperevm",
        chainId:    999,
        urls: {
          apiURL:     "https://explorer.hyperliquid.xyz/api",
          browserURL: "https://explorer.hyperliquid.xyz",
        },
      },
      {
        network:    "tempo",
        chainId:    4217,
        urls: {
          apiURL:     "https://explore.mainnet.tempo.xyz/api",
          browserURL: "https://explore.mainnet.tempo.xyz",
        },
      },
    ],
  },

  gasReporter: {
    enabled:  process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },

  paths: {
    sources:  "./contracts",
    tests:    "./test",
    cache:    "./cache",
    artifacts:"./artifacts",
  },
};

export default config;
