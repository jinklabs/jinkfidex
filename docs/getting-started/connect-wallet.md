# Connect Your Wallet

![](<../.gitbook/assets/connect-wallet.png>)

JinkFi supports any EVM-compatible wallet. The recommended and fastest experience is with **MetaMask** or any wallet supported by Privy's embedded wallet system.

---

## Supported Wallets

| Wallet | Method |
|---|---|
| MetaMask | Browser extension |
| Coinbase Wallet | Browser extension / mobile |
| WalletConnect | QR code scan — any mobile wallet |
| Privy Embedded | Email or social login (creates a wallet for you) |
| Rainbow | WalletConnect |
| Trust Wallet | WalletConnect |

---

## Step 1 — Open JinkFi

Navigate to the JinkFi app and click **"Connect Wallet"** in the top-right navigation bar.

![](<../.gitbook/assets/connect-step-1.png>)

---

## Step 2 — Choose Your Login Method

A modal will appear with wallet options. You can connect via:

- **Wallet** — MetaMask, Coinbase, or WalletConnect
- **Email** — Privy will create an embedded wallet tied to your email address
- **Social** — Google or Apple login

![](<../.gitbook/assets/connect-step-2.png>)

---

## Step 3 — Sign the SIWE Message

After connecting, JinkFi will ask you to **sign a message** (Sign-In With Ethereum). This is a free, gas-less signature that proves you own the wallet address. It is not a transaction — nothing is sent to the blockchain.

![](<../.gitbook/assets/connect-step-3.png>)

{% hint style="info" %}
The SIWE message contains a nonce and timestamp. It expires after 7 days and must be renewed on your next visit.
{% endhint %}

---

## Step 4 — Switch to Tempo

If your wallet is not already on the **Tempo** network, a prompt will appear to add and switch to it automatically.

![](<../.gitbook/assets/connect-step-4.png>)

{% hint style="success" %}
Tempo is added automatically — you do not need to configure it manually. Just click **"Switch Network"** when prompted.
{% endhint %}

---

## Disconnecting

Click your wallet address in the top-right corner, then select **"Disconnect"**.
