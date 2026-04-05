# Perpetuals

![](<../.gitbook/assets/perps-overview.png>)

The Perps page provides a decentralized perpetual futures trading interface. Open leveraged long or short positions on supported markets without an expiry date.

---

## What Are Perpetuals?

Perpetual contracts are derivatives that track an asset's price without a settlement date. You can hold a position indefinitely as long as your margin stays above the liquidation threshold. A **funding rate** is exchanged between longs and shorts to keep the perpetual price anchored to the spot price.

---

## Interface Overview

![](<../.gitbook/assets/perps-ui.png>)

| Section | Description |
|---|---|
| **Price Chart** | Real-time candlestick chart with volume |
| **Order Panel** | Enter position size, leverage, and direction |
| **Position List** | Your open positions and P&L |
| **Market Info** | Funding rate, open interest, 24h volume |

---

## Opening a Position

1. Navigate to **Perpetuals**
2. Select a market (e.g., ETH/USD)
3. Choose **Long** (price goes up) or **Short** (price goes down)
4. Enter your **margin** (collateral amount)
5. Set **leverage** (1x–20x)
6. Review the **liquidation price** shown
7. Click **Open Position** and confirm

![](<../.gitbook/assets/perps-order.png>)

{% hint style="warning" %}
Higher leverage increases both potential profit and risk of liquidation. At 10x leverage, a 10% move against your position will liquidate your margin. Start with low leverage.
{% endhint %}

---

## Funding Rate

The funding rate is paid every 8 hours between longs and shorts:

- If the perpetual trades **above** spot: longs pay shorts
- If the perpetual trades **below** spot: shorts pay longs

The current funding rate is displayed on the market info panel.

---

## Closing a Position

From the **Position List**:

1. Click **Close** on an open position
2. Choose to close fully or partially
3. Confirm the transaction

Realized P&L is returned to your wallet after fees.

---

## Liquidation

If your position's margin falls below the **maintenance margin** (due to adverse price movement), your position is automatically liquidated. The remaining margin minus a liquidation fee is returned.

{% hint style="info" %}
Monitor your positions regularly. You can add margin to an existing position at any time to reduce liquidation risk.
{% endhint %}

---

## Listing a Market (Projects)

Projects can submit a perpetual market for review:

1. Click **Create Market** on the Perps page
2. Provide the underlying asset details, oracle feed, and initial parameters
3. Pay the listing fee in native currency
4. JinkFi team reviews and deploys within 48 hours
