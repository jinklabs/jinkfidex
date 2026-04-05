# Swap

![](<../.gitbook/assets/swap-overview.png>)

The Swap page lets you exchange any two tokens at the best available price. JinkFi routes your trade through **Uniswap V2** and **V3** pools deployed natively on Tempo.

---

## How It Works

1. Select the token you want to **sell** (input)
2. Select the token you want to **buy** (output)
3. Enter the amount
4. Review the price, slippage, and route
5. Click **Swap** and confirm in your wallet

![](<../.gitbook/assets/swap-ui.png>)

---

## V2 vs V3 Routing

| | V2 | V3 |
|---|---|---|
| Pool type | Constant product (x·y=k) | Concentrated liquidity |
| Fee tiers | 0.3% fixed | 0.05%, 0.3%, or 1% |
| Best for | Volatile pairs | Stablecoin pairs or deep markets |
| Price impact | Higher on thin pools | Lower with good range coverage |

JinkFi automatically selects the route with the **lowest price impact** across both versions.

---

## Token Search

![](<../.gitbook/assets/swap-token-selector.png>)

The token selector lets you:

- **Search by name or symbol** — type to filter the list
- **Paste a contract address** — JinkFi will detect the address format, fetch the token's name, symbol, and decimals on-chain, and display it with a **CUSTOM** badge

{% hint style="warning" %}
When pasting a custom token address, always verify the contract on the [Tempo Explorer](https://explore.mainnet.tempo.xyz) before swapping. JinkFi does not audit custom tokens.
{% endhint %}

---

## Slippage Settings

Click the ⚙ settings icon to adjust:

- **Slippage tolerance** — the maximum price movement you will accept (default 0.5%)
- **Transaction deadline** — how long the transaction is valid (default 30 minutes)

![](<../.gitbook/assets/swap-settings.png>)

{% hint style="info" %}
For stablecoin swaps, use a lower slippage (0.1%). For new or illiquid tokens, you may need to increase it to 1–3%.
{% endhint %}

---

## Price Impact Warning

If a swap would move the market price by more than **2%**, a yellow warning is shown. Above **5%**, the interface shows a red warning and requires you to acknowledge before proceeding.

---

## Wrap / Unwrap WETH

To swap native USD ↔ WETH9 (wrapped USD on Tempo), select the pair and the interface will display a **Wrap** or **Unwrap** button instead of routing through a pool.
