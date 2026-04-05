# Staking

![](<../.gitbook/assets/staking-overview.png>)

The Staking page aggregates third-party staking pools submitted by projects and reviewed by the JinkFi team. Users can stake tokens to earn fixed or variable APY rewards from project treasury allocations.

---

## How Staking Differs from Farming

| | Staking | Farming |
|---|---|---|
| What you deposit | Project tokens | LP tokens |
| Who funds rewards | Project team | JinkFarm protocol |
| APY type | Fixed or variable, set by project | Dynamic, based on emissions |
| Lock period | Optional (0–3650 days) | No lock |

---

## Finding a Pool

![](<../.gitbook/assets/staking-pools.png>)

Each staking pool card displays:

| Field | Description |
|---|---|
| **Token** | The token you stake |
| **Reward Token** | The token you earn |
| **APY** | Annual percentage yield |
| **Lock Period** | Minimum stake duration (0 = flexible) |
| **Min Stake** | Minimum amount to stake |
| **TVL** | Total value locked in the pool |
| **End Date** | When rewards stop |

---

## Staking Tokens

1. Connect your wallet and navigate to **Staking**
2. Find a pool you want to participate in
3. Click **Stake**
4. Enter the amount to stake
5. Approve the token (one-time per token per pool)
6. Confirm the stake transaction

![](<../.gitbook/assets/staking-stake.png>)

{% hint style="warning" %}
If a pool has a lock period, you will not be able to withdraw your tokens until the lock expires. Always check the **Lock Period** before staking.
{% endhint %}

---

## Claiming Rewards

Rewards accrue in real time. Click **Claim** on your active stake to withdraw earned rewards without touching your principal.

---

## Unstaking

After the lock period (if any) expires, click **Unstake** to withdraw your principal plus any unclaimed rewards.

---

## Listing a Staking Pool

Projects can submit a staking pool for review:

1. Click **"List Your Project"** on the Staking page
2. Complete the submission form:
   - Token address and reward token address
   - APY, lock days, min/max stake amounts
   - Pool start and end dates
   - Project description and URL
3. Pay the **0.05 USD listing fee** (on Tempo)
4. The JinkFi team reviews and approves within 48 hours

![](<../.gitbook/assets/staking-create.png>)

{% hint style="info" %}
The listing fee covers admin review costs and is non-refundable regardless of approval status.
{% endhint %}
