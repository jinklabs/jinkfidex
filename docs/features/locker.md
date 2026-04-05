# Token Locker

![](<../.gitbook/assets/locker-overview.png>)

The JinkFi Locker is a **non-custodial, on-chain time-lock** protocol. It allows token projects to lock tokens or LP positions for a set duration to demonstrate commitment to their community and prevent rug pulls.

---

## What Can Be Locked?

| Lock Type | Description |
|---|---|
| **Token Lock** | Any ERC-20 token (team tokens, vesting allocations, treasury) |
| **LP Lock** | Uniswap V2 LP tokens (proves liquidity cannot be removed) |

---

## How It Works

When you create a lock, a new **TokenLockerV1** smart contract is deployed specifically for that lock. Your tokens are transferred into this contract and can only be withdrawn after the unlock time passes.

```
Your wallet
    │ createTokenLocker(token, amount, unlockDuration)
    ▼
TokenLockerManagerV1
    │ deploys new contract
    ▼
TokenLockerV1 (unique per lock)
    │ holds tokens until unlockTime
    ▼
You call withdraw() after unlock → tokens return to you
```

---

## Creating a Token Lock

![](<../.gitbook/assets/locker-create.png>)

1. Navigate to **Locker → Token Locks**
2. Enter the **Token Address** of the token to lock
3. Enter the **Amount** to lock
4. Set the **Unlock Date**
5. Click **Lock Tokens** and confirm the transaction

{% hint style="warning" %}
Locks are **irreversible** until the unlock time. Double-check the unlock date before confirming. There is no emergency withdrawal.
{% endhint %}

---

## Creating an LP Lock

1. Navigate to **Locker → LP Locks**
2. Enter the LP token address (the Uniswap V2 pair address)
3. Enter the amount of LP tokens to lock
4. Set the unlock date
5. Confirm

![](<../.gitbook/assets/locker-lp.png>)

{% hint style="info" %}
LP locks are displayed on the lock detail page with the **underlying token reserves** (token0 and token1 balances) so the community can verify how much liquidity is locked.
{% endhint %}

---

## Viewing Your Locks

The **My Token Locks** and **My LP Locks** tables show all locks created by your wallet with:

- Token address and symbol
- Locked amount
- Unlock date
- Status (Locked / Unlockable / Withdrawn)
- **Manage** button to extend or withdraw

![](<../.gitbook/assets/locker-list.png>)

---

## Extending a Lock

You can increase the unlock time or add more tokens to an existing lock at any time — but you can never reduce the lock period.

---

## Withdrawing After Unlock

Once the unlock date has passed:

1. Go to your lock in **My Locks**
2. Click **Manage → Withdraw**
3. Confirm the transaction

Tokens will be returned to your wallet.

---

## Sharing a Lock

Each lock has a unique on-chain ID. Share your lock ID with the community so they can verify it directly on the [Tempo Explorer](https://explore.mainnet.tempo.xyz) at the `TokenLockerManagerV1` contract:

```
0x95a8762DbE991d8c2a33aa056A55837CA3FeF30E
```
