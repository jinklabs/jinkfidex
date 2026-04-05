# Provide Liquidity (V3)

This guide covers concentrated liquidity positions on Uniswap V3. V3 lets you earn higher fees by focusing liquidity within a custom price range.

---

## When to Use V3 vs V2

| | V2 | V3 |
|---|---|---|
| Setup complexity | Simple | Requires range selection |
| Fee efficiency | Lower (spread across all prices) | Higher (if price stays in range) |
| Best for | Set-and-forget | Active managers or stable pairs |

---

## Step 1 — Go to Pool → V3 Position

Click **Pool** in the sidebar and select the **V3 Position** tab, then click **New Position**.

---

## Step 2 — Select Pair and Fee Tier

![](<../.gitbook/assets/guide-v3-select.png>)

1. Choose **Token A** and **Token B**
2. Select the **fee tier**:
   - **0.05%** — for stablecoin pairs (e.g., pathUSD/USDC.e)
   - **0.3%** — for standard pairs (e.g., WETH/USD)
   - **1%** — for exotic or volatile pairs

---

## Step 3 — Set Your Price Range

![](<../.gitbook/assets/guide-v3-range.png>)

Use the range selector to set a **lower price** and **upper price** for your position.

**Tips:**
- A **narrow range** around the current price earns more fees but requires more active management
- A **wide range** earns fewer fees but is more resilient to price movement
- For stablecoin pairs, use a tight range around 1.0

{% hint style="warning" %}
If the market price moves outside your range, your position stops earning fees and becomes 100% composed of one token. You'll need to close and reopen the position to reset the range.
{% endhint %}

---

## Step 4 — Enter Deposit Amount

Enter the amount for one token. The other amount adjusts based on the current price and your range. At range boundaries, one amount may be zero.

---

## Step 5 — Add Liquidity

1. Click **Approve** for each token (one-time)
2. Click **Add Liquidity**
3. Confirm in your wallet

Your position appears under **My Positions** with a unique NFT token ID.

---

## Collecting Fees

Fees accumulate in your position automatically. Click **Collect Fees** on your position card to withdraw earned fees without closing the position.

---

## Removing V3 Liquidity

1. Open the position from **My Positions**
2. Click **Remove Liquidity**
3. Select the percentage to remove (0–100%)
4. Confirm — fees are collected automatically on removal
