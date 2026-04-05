# Supported Chains

JinkFi is deployed natively on **Tempo mainnet**. Some features (bridge, quests) also interact with Ethereum, Base, and Arbitrum.

---

## Primary Chain — Tempo Mainnet

| Parameter | Value |
|---|---|
| **Chain ID** | 4217 |
| **Network Name** | Tempo Mainnet |
| **Native Currency** | USD (18 decimals) |
| **RPC URL** | `https://rpc.tempo.xyz` |
| **Explorer** | `https://explore.mainnet.tempo.xyz` |

All DEX, farm, locker, staking, and quest contracts are deployed on Tempo. Gas fees are paid in USD.

---

## Adding Tempo to Your Wallet

### MetaMask

1. Open MetaMask → Settings → Networks → Add Network
2. Enter:
   - **Network Name**: Tempo Mainnet
   - **RPC URL**: `https://rpc.tempo.xyz`
   - **Chain ID**: 4217
   - **Currency Symbol**: USD
   - **Explorer URL**: `https://explore.mainnet.tempo.xyz`
3. Click Save

### Automatic Add

When you connect your wallet to JinkFi, it will prompt you to add Tempo automatically if it's not already configured.

---

## Cross-Chain Support

JinkFi's bridge supports moving assets to/from Tempo from:

| Chain | Chain ID | Native Currency |
|---|---|---|
| Ethereum | 1 | ETH |
| Base | 8453 | ETH |
| Arbitrum One | 42161 | ETH |

{% hint style="info" %}
Swap, Pool, Farm, Locker, and Staking features only work on Tempo. Make sure you are connected to Tempo before using these pages.
{% endhint %}

---

## Gas on Tempo

Gas on Tempo is priced in USD. Typical transaction costs:

| Action | Approximate Gas Cost |
|---|---|
| Swap (V2) | ~$0.001 |
| Swap (V3) | ~$0.002 |
| Add V2 Liquidity | ~$0.002 |
| Add V3 Position | ~$0.003 |
| Farm Deposit | ~$0.001 |
| Lock Tokens | ~$0.002 |

Costs vary based on network congestion and contract complexity.
