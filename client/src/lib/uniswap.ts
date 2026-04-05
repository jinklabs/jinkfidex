// ── Uniswap V3 ────────────────────────────────────────────────────────────────
export const V3_FEE_TIERS = [
  { label: "0.01%", fee: 100,   tickSpacing: 1   },
  { label: "0.05%", fee: 500,   tickSpacing: 10  },
  { label: "0.3%",  fee: 3000,  tickSpacing: 60  },
  { label: "1%",    fee: 10000, tickSpacing: 200 },
] as const;

export type V3FeeTier = typeof V3_FEE_TIERS[number]["fee"];

export const QUOTER_V2_ABI = [
  {
    inputs: [{ components: [{ name: "tokenIn", type: "address" }, { name: "tokenOut", type: "address" }, { name: "amountIn", type: "uint256" }, { name: "fee", type: "uint24" }, { name: "sqrtPriceLimitX96", type: "uint160" }], name: "params", type: "tuple" }],
    name: "quoteExactInputSingle",
    outputs: [{ name: "amountOut", type: "uint256" }, { name: "sqrtPriceX96After", type: "uint160" }, { name: "initializedTicksCrossed", type: "uint32" }, { name: "gasEstimate", type: "uint256" }],
    stateMutability: "nonpayable", type: "function",
  },
] as const;

export const SWAP_ROUTER_V3_ABI = [
  {
    inputs: [{ components: [{ name: "tokenIn", type: "address" }, { name: "tokenOut", type: "address" }, { name: "fee", type: "uint24" }, { name: "recipient", type: "address" }, { name: "amountIn", type: "uint256" }, { name: "amountOutMinimum", type: "uint256" }, { name: "sqrtPriceLimitX96", type: "uint160" }], name: "params", type: "tuple" }],
    name: "exactInputSingle",
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "payable", type: "function",
  },
  {
    inputs: [{ components: [{ name: "path", type: "bytes" }, { name: "recipient", type: "address" }, { name: "amountIn", type: "uint256" }, { name: "amountOutMinimum", type: "uint256" }], name: "params", type: "tuple" }],
    name: "exactInput",
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "payable", type: "function",
  },
  { inputs: [], name: "WETH9", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
] as const;

export const NONFUNGIBLE_POSITION_MANAGER_ABI = [
  {
    inputs: [{ components: [{ name: "token0", type: "address" }, { name: "token1", type: "address" }, { name: "fee", type: "uint24" }, { name: "tickLower", type: "int24" }, { name: "tickUpper", type: "int24" }, { name: "amount0Desired", type: "uint256" }, { name: "amount1Desired", type: "uint256" }, { name: "amount0Min", type: "uint256" }, { name: "amount1Min", type: "uint256" }, { name: "recipient", type: "address" }, { name: "deadline", type: "uint256" }], name: "params", type: "tuple" }],
    name: "mint",
    outputs: [{ name: "tokenId", type: "uint256" }, { name: "liquidity", type: "uint128" }, { name: "amount0", type: "uint256" }, { name: "amount1", type: "uint256" }],
    stateMutability: "payable", type: "function",
  },
  {
    inputs: [{ components: [{ name: "tokenId", type: "uint256" }, { name: "liquidity", type: "uint128" }, { name: "amount0Min", type: "uint256" }, { name: "amount1Min", type: "uint256" }, { name: "deadline", type: "uint256" }], name: "params", type: "tuple" }],
    name: "decreaseLiquidity",
    outputs: [{ name: "amount0", type: "uint256" }, { name: "amount1", type: "uint256" }],
    stateMutability: "payable", type: "function",
  },
  { inputs: [{ name: "owner", type: "address" }], name: "balanceOf", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "owner", type: "address" }, { name: "index", type: "uint256" }], name: "tokenOfOwnerByIndex", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "tokenId", type: "uint256" }], name: "positions", outputs: [{ name: "nonce", type: "uint96" }, { name: "operator", type: "address" }, { name: "token0", type: "address" }, { name: "token1", type: "address" }, { name: "fee", type: "uint24" }, { name: "tickLower", type: "int24" }, { name: "tickUpper", type: "int24" }, { name: "liquidity", type: "uint128" }, { name: "feeGrowthInside0LastX128", type: "uint256" }, { name: "feeGrowthInside1LastX128", type: "uint256" }, { name: "tokensOwed0", type: "uint128" }, { name: "tokensOwed1", type: "uint128" }], stateMutability: "view", type: "function" },
] as const;

// ── V3 Pool / Factory ABIs ─────────────────────────────────────────────────────
export const V3_POOL_ABI = [
  {
    inputs: [], name: "slot0",
    outputs: [
      { name: "sqrtPriceX96", type: "uint160" },
      { name: "tick",         type: "int24"   },
      { name: "observationIndex",            type: "uint16" },
      { name: "observationCardinality",      type: "uint16" },
      { name: "observationCardinalityNext",  type: "uint16" },
      { name: "feeProtocol",                 type: "uint8"  },
      { name: "unlocked",                    type: "bool"   },
    ],
    stateMutability: "view", type: "function",
  },
] as const;

export const V3_FACTORY_ABI = [
  {
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "fee",    type: "uint24"  },
    ],
    name: "getPool",
    outputs: [{ name: "pool", type: "address" }],
    stateMutability: "view", type: "function",
  },
] as const;

export const V3_FACTORY_ADDRESSES: Record<number, `0x${string}`> = {
  1:        "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  11155111: "0xD156649d5B844d9a72cF157c645c9aB0E016ccaf",
  8453:     "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
  42161:    "0x1F98431c8aD98523631AE4a59f267346ea31F984",
};

// ── Uniswap V4 ────────────────────────────────────────────────────────────────
export const POOL_MANAGER_ABI = [
  {
    inputs: [{ components: [{ name: "currency0", type: "address" }, { name: "currency1", type: "address" }, { name: "fee", type: "uint24" }, { name: "tickSpacing", type: "int24" }, { name: "hooks", type: "address" }], name: "key", type: "tuple" }, { name: "sqrtPriceX96", type: "uint160" }],
    name: "initialize",
    outputs: [{ name: "tick", type: "int24" }],
    stateMutability: "nonpayable", type: "function",
  },
  {
    inputs: [{ components: [{ name: "currency0", type: "address" }, { name: "currency1", type: "address" }, { name: "fee", type: "uint24" }, { name: "tickSpacing", type: "int24" }, { name: "hooks", type: "address" }], name: "key", type: "tuple" }],
    name: "getSlot0",
    outputs: [
      { name: "sqrtPriceX96", type: "uint160" },
      { name: "tick",         type: "int24"   },
      { name: "protocolFee",  type: "uint24"  },
      { name: "lpFee",        type: "uint24"  },
    ],
    stateMutability: "view", type: "function",
  },
] as const;

// V4 PositionManager — modifyLiquidities is the single entry point for all liquidity ops
export const V4_POSITION_MANAGER_ABI = [
  {
    inputs: [
      { name: "unlockData", type: "bytes"   },
      { name: "deadline",   type: "uint256" },
    ],
    name: "modifyLiquidities",
    outputs: [],
    stateMutability: "payable", type: "function",
  },
  {
    inputs: [
      { components: [{ name: "currency0", type: "address" }, { name: "currency1", type: "address" }, { name: "fee", type: "uint24" }, { name: "tickSpacing", type: "int24" }, { name: "hooks", type: "address" }], name: "key", type: "tuple" },
      { name: "sqrtPriceX96", type: "uint160" },
      { name: "hookData",     type: "bytes"   },
    ],
    name: "initializePool",
    outputs: [{ name: "tick", type: "int24" }],
    stateMutability: "payable", type: "function",
  },
] as const;

// V4 Actions enum indices (from PositionManager.sol)
export const V4_ACTIONS = {
  INCREASE_LIQUIDITY:  0,
  DECREASE_LIQUIDITY:  1,
  MINT_POSITION:       2,
  BURN_POSITION:       3,
  SETTLE:              6,
  SETTLE_ALL:          7,
  CLOSE_CURRENCY:      8,
  TAKE:               10,
  TAKE_ALL:           11,
  TAKE_PAIR:          12,
  SETTLE_PAIR:        13,
} as const;

// ── Contract Addresses ─────────────────────────────────────────────────────────
export const UNISWAP_ADDRESSES: Record<number, {
  v2Router: `0x${string}`;
  v2Factory: `0x${string}`;
  v3Router: `0x${string}`;
  v3QuoterV2: `0x${string}`;
  v3PositionManager: `0x${string}`;
  v4PoolManager: `0x${string}`;
  v4PositionManager: `0x${string}`;
  universalRouter: `0x${string}`;
  weth: `0x${string}`;
}> = {
  1: {
    v2Router:          "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    v2Factory:         "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    v3Router:          "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    v3QuoterV2:        "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
    v3PositionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    v4PoolManager:     "0x000000000004444c5dc75cB358380D2e3dE08A90",
    v4PositionManager: "0xbD216513d74C8cf14CF4747E6AaA6420FF7E55d6",
    universalRouter:   "0x66a9893cC07D91D95644AEDD05D03f95e1dBA8AF",
    weth:              "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  8453: { // Base
    v2Router:          "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
    v2Factory:         "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6",
    v3Router:          "0x2626664c2603336E57B271c5C0b26F421741e481",
    v3QuoterV2:        "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
    v3PositionManager: "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1",
    v4PoolManager:     "0x498581fF718922c3f8e6A244956aF099B2652b2b",
    v4PositionManager: "0x7C5f5A4bBd8fD63184577525326123B519429bDc",
    universalRouter:   "0x6fF5693b99212Da76ad316178A184AB56D299b43",
    weth:              "0x4200000000000000000000000000000000000006",
  },
  11155111: { // Sepolia — JinkFi deployment
    v2Router:          "0x01faa5159FC0d9103efC0E8274fBD36D4f2e12DE",
    v2Factory:         "0x4Ad76DCe86BecEBC48Aba2f4dD0F685D6C3B7430",
    v3Router:          "0x0e2B6BE041806391534B18AD2AE1548d8AA088C4",
    v3QuoterV2:        "0xa4E0c4Fc04B3786bE5687B70Be9c5abEEae2d51f",
    v3PositionManager: "0x582787a17A0cf0fdbf893771739E8C150446692e",
    v4PoolManager:     "0x0000000000000000000000000000000000000000",
    v4PositionManager: "0x0000000000000000000000000000000000000000",
    universalRouter:   "0xA1E608E29016430a486A88a2Da719DDdBdA054bC",
    weth:              "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
  },
  42161: { // Arbitrum
    v2Router:          "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
    v2Factory:         "0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9",
    v3Router:          "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    v3QuoterV2:        "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
    v3PositionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    v4PoolManager:     "0x360E68faCcca8cA495c1B759Fd9EEe4100240312",
    v4PositionManager: "0xd88F38F930b7952f2DB2432Cb002E7abbF2B4534",
    universalRouter:   "0xa51afaFe0263b40EdaEf0Bc6b37Ec176bae9b07A",
    weth:              "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  },
};

// ── V4 Hooks ──────────────────────────────────────────────────────────────────
export const V4_HOOKS = [
  { name: "No Hook", address: "0x0000000000000000000000000000000000000000", description: "Standard pool, no custom logic" },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
export function tickToPrice(tick: number, token0Decimals = 18, token1Decimals = 18): number {
  return Math.pow(1.0001, tick) * Math.pow(10, token0Decimals - token1Decimals);
}

export function priceToTick(price: number, token0Decimals = 18, token1Decimals = 18): number {
  return Math.floor(Math.log(price * Math.pow(10, token1Decimals - token0Decimals)) / Math.log(1.0001));
}

export function nearestUsableTick(tick: number, tickSpacing: number): number {
  return Math.round(tick / tickSpacing) * tickSpacing;
}
