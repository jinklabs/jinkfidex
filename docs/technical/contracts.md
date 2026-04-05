# Smart Contracts

All JinkFi smart contracts are deployed on Tempo mainnet (chainId 4217). The core DEX contracts are Uniswap V2/V3 compatible.

---

## Contract Addresses — Tempo Mainnet (4217)

### DEX Contracts

| Contract | Address |
|---|---|
| **V2 Router** | `0xd74136ec9100303861B08b809fEAbC333611dA66` |
| **V2 Factory** | `0xd8db8b03281ee11DF78944772778843C54814913` |
| **WETH9 (Wrapped USD)** | `0xE657646165f00907e8cBcFE5aDB8A6F5cdc5f454` |

### V3 Contracts

| Contract | Address |
|---|---|
| **V3 Factory** | `0x28b25620F0956f509Bd0E07ED9D9Ad53725D2752` |
| **V3 SwapRouter** | `0xCdBF78b0c7e4428093Fe60973E9379D5BcFe1BBB` |
| **NonfungiblePositionManager** | `0x6535b354cEAD3739a6403D84E679F6d537039052` |
| **QuoterV2** | `0x1EB1AF14374F61B30b2D96841c6F48d473aa1b8c` |
| **UniversalRouter** | `0x7482240897747fE08E0aAf80A8C83081B6cce67A` |

### Protocol Contracts

| Contract | Address |
|---|---|
| **TokenLockerManagerV1** | `0x95a8762DbE991d8c2a33aa056A55837CA3FeF30E` |
| **JinkFarm** | `0x8d100056891a2D80A2aecf1fd7aaE14c6Aa3e916` |

---

## Contract Architecture

```
User
 │
 ├─► V2 Router ──► V2 Factory ──► V2 Pair contracts (per token pair)
 │
 ├─► V3 SwapRouter ──► V3 Factory ──► V3 Pool contracts (per pair+fee)
 │        │
 │        └─► NonfungiblePositionManager (LP NFTs)
 │
 ├─► TokenLockerManagerV1 ──► deploys TokenLockerV1 (per lock)
 │
 └─► JinkFarm ──► reads V2 LP token balances, distributes JINK
```

---

## TokenLockerManagerV1

The locker factory deploys a new `TokenLockerV1` contract for each lock. Functions:

| Function | Description |
|---|---|
| `createTokenLocker(token, amount, unlockDuration)` | Creates a new token lock |
| `getTokenLockers(owner)` | Returns all lock addresses for an owner |

Each deployed `TokenLockerV1` has:

| Function | Description |
|---|---|
| `withdraw()` | Withdraws tokens after unlock time |
| `extendLock(newUnlockTime)` | Extends the lock duration |
| `incrementLock(amount)` | Adds more tokens to the lock |
| `unlockTime()` | View the unlock timestamp |

---

## JinkFarm

MasterChef-style yield farm. Functions:

| Function | Description |
|---|---|
| `deposit(pid, amount)` | Deposit LP tokens into a farm pool |
| `withdraw(pid, amount)` | Withdraw LP tokens and harvest rewards |
| `harvest(pid)` | Claim pending JINK without withdrawing |
| `pendingReward(pid, user)` | View claimable JINK for a user |
| `poolInfo(pid)` | View pool details (LP token, alloc points, etc.) |

---

## Verifying Contracts

Contracts can be verified on the [Tempo Explorer](https://explore.mainnet.tempo.xyz). Search by contract address to view bytecode, read/write functions, and transaction history.
