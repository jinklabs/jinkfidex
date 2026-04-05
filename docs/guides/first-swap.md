# Your First Swap

This guide walks you through making your first token swap on JinkFi from start to finish.

---

## Prerequisites

- A browser wallet installed (MetaMask, Rabby, or any WalletConnect-compatible wallet)
- Some USD (native token on Tempo) in your wallet for gas
- Tokens you want to swap

If you don't have the Tempo network set up yet, see [Network Setup](../getting-started/network-setup.md).

---

## Step 1 — Connect Your Wallet

![](<../.gitbook/assets/guide-swap-connect.png>)

Click **Connect Wallet** in the top-right corner and approve the connection in your wallet.

---

## Step 2 — Navigate to Swap

Click **Swap** in the left sidebar. You will see the swap interface with two token fields.

---

## Step 3 — Select Your Tokens

![](<../.gitbook/assets/guide-swap-tokens.png>)

1. Click the top token field and search for the token you want to **sell**
2. Click the bottom token field and search for the token you want to **buy**
3. You can search by name, symbol, or paste a contract address

---

## Step 4 — Enter an Amount

Type the amount in the **sell** field. The buy amount updates automatically based on the current pool price.

Review:

- **Rate** — how many tokens you receive per token sold
- **Price Impact** — how much your trade moves the market (keep below 2%)
- **Route** — which pool(s) the swap uses

---

## Step 5 — Adjust Slippage (Optional)

Click the ⚙ settings icon to change slippage tolerance:

- Default is **0.5%** — works for most pairs
- Use **0.1%** for stablecoins
- Use **1–3%** for new tokens with low liquidity

---

## Step 6 — Confirm the Swap

![](<../.gitbook/assets/guide-swap-confirm.png>)

Click **Swap** then confirm the transaction in your wallet. The swap executes on-chain and your new tokens appear in your wallet within seconds.

{% hint style="success" %}
That's it! Your tokens have been swapped. You can verify the transaction on the [Tempo Explorer](https://explore.mainnet.tempo.xyz).
{% endhint %}
