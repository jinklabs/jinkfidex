# Yield Farming

![](<../.gitbook/assets/farm-overview.png>)

The Farm page lets you stake your LP tokens to earn **JINK** reward emissions on top of the swap fees you already earn as a liquidity provider.

---

## How Farming Works

```
You provide liquidity → receive LP tokens
           ↓
  Deposit LP tokens into JinkFarm
           ↓
  Earn JINK rewards every second
           ↓
  Harvest at any time, or withdraw LP + rewards together
```

---

## Farm Interface

![](<../.gitbook/assets/farm-ui.png>)

Each farm card shows:

| Field | Description |
|---|---|
| **Pool** | The LP token pair (e.g. pathUSD / USDC.e) |
| **APR** | Estimated annual reward rate |
| **TVL** | Total USD value deposited in this farm |
| **Multiplier** | Relative reward weight vs other farms |
| **Your Stake** | Your deposited LP token amount |
| **Pending Reward** | JINK rewards claimable now |

---

## Depositing LP Tokens

1. First, [add liquidity](pool.md) to the corresponding V2 pool to receive LP tokens
2. On the Farm page, click **Deposit** on the farm card
3. Enter the amount of LP tokens to deposit
4. Approve the farm contract (one-time), then confirm the deposit

![](<../.gitbook/assets/farm-deposit.png>)

{% hint style="success" %}
Your LP tokens continue earning swap fees even while staked in the farm. Farming gives you an additional JINK reward layer on top.
{% endhint %}

---

## Harvesting Rewards

Click **Harvest** on any farm card to claim your accumulated JINK rewards without withdrawing your LP tokens.

![](<../.gitbook/assets/farm-harvest.png>)

---

## Withdrawing

Click **Withdraw** to remove your LP tokens from the farm. You can choose to:

- Withdraw LP tokens only (rewards remain accumulating)
- Withdraw LP tokens and harvest all pending rewards simultaneously

---

## Reward Emissions

| Field | Value |
|---|---|
| Reward Token | JINK |
| Emission Rate | 1 JINK / second (configurable by admin) |
| Distribution | Proportional to each pool's allocation points |
| Farm Duration | 90 days per funding cycle |

{% hint style="info" %}
Farms must be funded by the admin with JINK tokens to emit rewards. Check the **endTime** displayed on the farm card — rewards stop when the farm reaches its end time.
{% endhint %}

---

## Allocation Points

Each pool has an allocation of points that determines its share of total JINK emissions:

```
Pool reward rate = (pool.allocPoint / totalAllocPoint) × rewardPerSecond
```

Pools with higher multipliers (e.g. 40×) receive a larger share.
