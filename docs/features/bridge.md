# Bridge

![](<../.gitbook/assets/bridge-overview.png>)

The Bridge page allows you to move assets between Tempo and other EVM-compatible networks. JinkFi integrates an embedded bridge interface directly within the app so you never need to leave the platform.

---

## Supported Routes

| From | To | Assets |
|---|---|---|
| Ethereum | Tempo | ETH, USDC, USDT |
| Base | Tempo | ETH, USDC |
| Arbitrum | Tempo | ETH, USDC |
| Tempo | Ethereum | USD, USDC.e |

{% hint style="info" %}
Routes and supported assets expand as Tempo's bridge liquidity grows. Check the Bridge page for the latest available pairs.
{% endhint %}

---

## How to Bridge

![](<../.gitbook/assets/bridge-ui.png>)

1. Navigate to **Bridge**
2. Select the **source network** (where your tokens currently are)
3. Select the **destination network** (where you want to send them)
4. Choose the **token** and enter the **amount**
5. Review the estimated receive amount and bridge fee
6. Click **Bridge** and confirm in your wallet

{% hint style="warning" %}
Bridge transactions are cross-chain and typically take 1–15 minutes to finalize depending on the route. Do not close the window until the transaction is confirmed on both chains.
{% endhint %}

---

## Fees

Bridge fees vary by route and include:

- **Gas fee** on the source chain
- **Bridge protocol fee** (shown before confirmation)
- **Gas fee** on the destination chain (paid by the bridge relayer)

---

## Checking Bridge Status

After submitting a bridge transaction, a status tracker appears showing:

1. Source chain confirmation
2. Bridge relay in progress
3. Destination chain delivery

You can also track the transaction using the [Tempo Explorer](https://explore.mainnet.tempo.xyz) or the source chain's block explorer.
