# What is JinkFi?

![](<../.gitbook/assets/overview-hero.png>)

JinkFi is a **complete DeFi terminal** deployed natively on the **Tempo** blockchain. It is the first all-in-one protocol on Tempo, combining a DEX, yield farm, token locker, quest platform, and cross-chain bridge into a single permissionless interface.

---

## Why Tempo?

Tempo (chainId 4217) is a high-performance EVM-compatible chain with USD as its native currency. This means:

- Gas fees are paid in **USD** — no need to hold a volatile native token just to transact
- Fast block times and low transaction costs
- Full EVM compatibility — every Solidity contract works out of the box

---

## Protocol Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      JinkFi UI                          │
│   React 19 · Vite · wagmi v3 · viem v2 · Privy          │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼───────┐        ┌────────▼────────┐
│  JinkFi API   │        │  Tempo RPC      │
│  Express 5    │        │  rpc.tempo.xyz  │
│  Prisma 7     │        └─────────────────┘
│  PostgreSQL   │
│  Redis Cache  │
└───────────────┘
        │
┌───────▼───────────────────────────────────────┐
│            Smart Contracts (Tempo)             │
│  Uniswap V2 Factory + Router                   │
│  Uniswap V3 Factory + PositionManager          │
│  Universal Router · QuoterV2                   │
│  TokenLockerManagerV1 · JinkFarm               │
└───────────────────────────────────────────────┘
```

---

## Core Principles

**Permissionless** — Anyone can trade, provide liquidity, create locks, submit quests, or list staking pools without needing approval.

**Non-Custodial** — JinkFi never holds your tokens. Every action is an on-chain transaction signed by your wallet.

**Open** — The smart contracts are deployed and verifiable on Tempo. The source code is public on GitHub.

---

## Getting Help

- Twitter / X: [@JinkFi](https://x.com/JinkFi)
- Discord: [discord.gg/jinkfi](https://discord.gg/jinkfi)
