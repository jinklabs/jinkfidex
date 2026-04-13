// ── ERC-20 ────────────────────────────────────────────────────────────────────
export const ERC20_ABI = [
  { inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], name: "allowance", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], name: "approve", outputs: [{ type: "bool" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "decimals", outputs: [{ type: "uint8" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "name", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "symbol", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalSupply", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], name: "transfer", outputs: [{ type: "bool" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "amount", type: "uint256" }], name: "transferFrom", outputs: [{ type: "bool" }], stateMutability: "nonpayable", type: "function" },
  { anonymous: false, inputs: [{ indexed: true, name: "owner", type: "address" }, { indexed: true, name: "spender", type: "address" }, { indexed: false, name: "value", type: "uint256" }], name: "Approval", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "from", type: "address" }, { indexed: true, name: "to", type: "address" }, { indexed: false, name: "value", type: "uint256" }], name: "Transfer", type: "event" },
] as const;

// ── WETH9 ─────────────────────────────────────────────────────────────────────
export const WETH9_ABI = [
  ...ERC20_ABI,
  { inputs: [], name: "deposit", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "wad", type: "uint256" }], name: "withdraw", outputs: [], stateMutability: "nonpayable", type: "function" },
] as const;

// ── Uniswap V2 Router ─────────────────────────────────────────────────────────
export const ROUTER_ABI = [
  { inputs: [], name: "WETH", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "factory", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "tokenA", type: "address" }, { name: "tokenB", type: "address" }, { name: "amountADesired", type: "uint256" }, { name: "amountBDesired", type: "uint256" }, { name: "amountAMin", type: "uint256" }, { name: "amountBMin", type: "uint256" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], name: "addLiquidity", outputs: [{ name: "amountA", type: "uint256" }, { name: "amountB", type: "uint256" }, { name: "liquidity", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "token", type: "address" }, { name: "amountTokenDesired", type: "uint256" }, { name: "amountTokenMin", type: "uint256" }, { name: "amountETHMin", type: "uint256" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], name: "addLiquidityETH", outputs: [{ name: "amountToken", type: "uint256" }, { name: "amountETH", type: "uint256" }, { name: "liquidity", type: "uint256" }], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "tokenA", type: "address" }, { name: "tokenB", type: "address" }, { name: "liquidity", type: "uint256" }, { name: "amountAMin", type: "uint256" }, { name: "amountBMin", type: "uint256" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], name: "removeLiquidity", outputs: [{ name: "amountA", type: "uint256" }, { name: "amountB", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "token", type: "address" }, { name: "liquidity", type: "uint256" }, { name: "amountTokenMin", type: "uint256" }, { name: "amountETHMin", type: "uint256" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], name: "removeLiquidityETH", outputs: [{ name: "amountToken", type: "uint256" }, { name: "amountETH", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "token", type: "address" }, { name: "liquidity", type: "uint256" }, { name: "amountTokenMin", type: "uint256" }, { name: "amountETHMin", type: "uint256" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], name: "removeLiquidityETHSupportingFeeOnTransferTokens", outputs: [{ name: "amountETH", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "token", type: "address" }, { name: "liquidity", type: "uint256" }, { name: "amountTokenMin", type: "uint256" }, { name: "amountETHMin", type: "uint256" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }, { name: "approveMax", type: "bool" }, { name: "v", type: "uint8" }, { name: "r", type: "bytes32" }, { name: "s", type: "bytes32" }], name: "removeLiquidityETHWithPermit", outputs: [{ name: "amountToken", type: "uint256" }, { name: "amountETH", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "token", type: "address" }, { name: "liquidity", type: "uint256" }, { name: "amountTokenMin", type: "uint256" }, { name: "amountETHMin", type: "uint256" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }, { name: "approveMax", type: "bool" }, { name: "v", type: "uint8" }, { name: "r", type: "bytes32" }, { name: "s", type: "bytes32" }], name: "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens", outputs: [{ name: "amountETH", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "tokenA", type: "address" }, { name: "tokenB", type: "address" }, { name: "liquidity", type: "uint256" }, { name: "amountAMin", type: "uint256" }, { name: "amountBMin", type: "uint256" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }, { name: "approveMax", type: "bool" }, { name: "v", type: "uint8" }, { name: "r", type: "bytes32" }, { name: "s", type: "bytes32" }], name: "removeLiquidityWithPermit", outputs: [{ name: "amountA", type: "uint256" }, { name: "amountB", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "amountOutMin", type: "uint256" }, { name: "path", type: "address[]" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], name: "swapExactETHForTokens", outputs: [{ name: "amounts", type: "uint256[]" }], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "amountOutMin", type: "uint256" }, { name: "path", type: "address[]" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], name: "swapExactETHForTokensSupportingFeeOnTransferTokens", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "amountIn", type: "uint256" }, { name: "amountOutMin", type: "uint256" }, { name: "path", type: "address[]" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], name: "swapExactTokensForETH", outputs: [{ name: "amounts", type: "uint256[]" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "amountIn", type: "uint256" }, { name: "amountOutMin", type: "uint256" }, { name: "path", type: "address[]" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], name: "swapExactTokensForETHSupportingFeeOnTransferTokens", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "amountIn", type: "uint256" }, { name: "amountOutMin", type: "uint256" }, { name: "path", type: "address[]" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], name: "swapExactTokensForTokens", outputs: [{ name: "amounts", type: "uint256[]" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "amountIn", type: "uint256" }, { name: "amountOutMin", type: "uint256" }, { name: "path", type: "address[]" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], name: "swapExactTokensForTokensSupportingFeeOnTransferTokens", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "amountOut", type: "uint256" }, { name: "path", type: "address[]" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], name: "swapETHForExactTokens", outputs: [{ name: "amounts", type: "uint256[]" }], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "amountOut", type: "uint256" }, { name: "amountInMax", type: "uint256" }, { name: "path", type: "address[]" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], name: "swapTokensForExactETH", outputs: [{ name: "amounts", type: "uint256[]" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "amountOut", type: "uint256" }, { name: "amountInMax", type: "uint256" }, { name: "path", type: "address[]" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], name: "swapTokensForExactTokens", outputs: [{ name: "amounts", type: "uint256[]" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "amountOut", type: "uint256" }, { name: "reserveIn", type: "uint256" }, { name: "reserveOut", type: "uint256" }], name: "getAmountIn", outputs: [{ name: "amountIn", type: "uint256" }], stateMutability: "pure", type: "function" },
  { inputs: [{ name: "amountIn", type: "uint256" }, { name: "reserveIn", type: "uint256" }, { name: "reserveOut", type: "uint256" }], name: "getAmountOut", outputs: [{ name: "amountOut", type: "uint256" }], stateMutability: "pure", type: "function" },
  { inputs: [{ name: "amountOut", type: "uint256" }, { name: "path", type: "address[]" }], name: "getAmountsIn", outputs: [{ name: "amounts", type: "uint256[]" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "amountIn", type: "uint256" }, { name: "path", type: "address[]" }], name: "getAmountsOut", outputs: [{ name: "amounts", type: "uint256[]" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "amountA", type: "uint256" }, { name: "reserveA", type: "uint256" }, { name: "reserveB", type: "uint256" }], name: "quote", outputs: [{ name: "amountB", type: "uint256" }], stateMutability: "pure", type: "function" },
] as const;

// ── Uniswap V2 Factory ────────────────────────────────────────────────────────
export const FACTORY_ABI = [
  { inputs: [{ name: "tokenA", type: "address" }, { name: "tokenB", type: "address" }], name: "createPair", outputs: [{ name: "pair", type: "address" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "tokenA", type: "address" }, { name: "tokenB", type: "address" }], name: "getPair", outputs: [{ name: "pair", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "uint256" }], name: "allPairs", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "allPairsLength", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "feeTo", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "feeToSetter", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_feeTo", type: "address" }], name: "setFeeTo", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_feeToSetter", type: "address" }], name: "setFeeToSetter", outputs: [], stateMutability: "nonpayable", type: "function" },
  { anonymous: false, inputs: [{ indexed: true, name: "token0", type: "address" }, { indexed: true, name: "token1", type: "address" }, { indexed: false, name: "pair", type: "address" }, { indexed: false, name: "", type: "uint256" }], name: "PairCreated", type: "event" },
] as const;

// ── Uniswap V2 Pair ───────────────────────────────────────────────────────────
export const PAIR_ABI = [
  { inputs: [], name: "DOMAIN_SEPARATOR", outputs: [{ type: "bytes32" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "MINIMUM_LIQUIDITY", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "PERMIT_TYPEHASH", outputs: [{ type: "bytes32" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "address" }, { name: "", type: "address" }], name: "allowance", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "spender", type: "address" }, { name: "value", type: "uint256" }], name: "approve", outputs: [{ type: "bool" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "", type: "address" }], name: "balanceOf", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "to", type: "address" }], name: "burn", outputs: [{ name: "amount0", type: "uint256" }, { name: "amount1", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "decimals", outputs: [{ type: "uint8" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "factory", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getReserves", outputs: [{ name: "reserve0", type: "uint112" }, { name: "reserve1", type: "uint112" }, { name: "blockTimestampLast", type: "uint32" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_token0", type: "address" }, { name: "_token1", type: "address" }], name: "initialize", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "kLast", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "to", type: "address" }], name: "mint", outputs: [{ name: "liquidity", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "name", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "address" }], name: "nonces", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }, { name: "value", type: "uint256" }, { name: "deadline", type: "uint256" }, { name: "v", type: "uint8" }, { name: "r", type: "bytes32" }, { name: "s", type: "bytes32" }], name: "permit", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "price0CumulativeLast", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "price1CumulativeLast", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "to", type: "address" }], name: "skim", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "amount0Out", type: "uint256" }, { name: "amount1Out", type: "uint256" }, { name: "to", type: "address" }, { name: "data", type: "bytes" }], name: "swap", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "symbol", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "sync", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "token0", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "token1", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalSupply", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "to", type: "address" }, { name: "value", type: "uint256" }], name: "transfer", outputs: [{ type: "bool" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "value", type: "uint256" }], name: "transferFrom", outputs: [{ type: "bool" }], stateMutability: "nonpayable", type: "function" },
  { anonymous: false, inputs: [{ indexed: true, name: "owner", type: "address" }, { indexed: true, name: "spender", type: "address" }, { indexed: false, name: "value", type: "uint256" }], name: "Approval", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "sender", type: "address" }, { indexed: false, name: "amount0", type: "uint256" }, { indexed: false, name: "amount1", type: "uint256" }, { indexed: true, name: "to", type: "address" }], name: "Burn", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "sender", type: "address" }, { indexed: false, name: "amount0", type: "uint256" }, { indexed: false, name: "amount1", type: "uint256" }], name: "Mint", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "sender", type: "address" }, { indexed: false, name: "amount0In", type: "uint256" }, { indexed: false, name: "amount1In", type: "uint256" }, { indexed: false, name: "amount0Out", type: "uint256" }, { indexed: false, name: "amount1Out", type: "uint256" }, { indexed: true, name: "to", type: "address" }], name: "Swap", type: "event" },
  { anonymous: false, inputs: [{ indexed: false, name: "reserve0", type: "uint112" }, { indexed: false, name: "reserve1", type: "uint112" }], name: "Sync", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "from", type: "address" }, { indexed: true, name: "to", type: "address" }, { indexed: false, name: "value", type: "uint256" }], name: "Transfer", type: "event" },
] as const;

// ── Uniswap V3 Factory ────────────────────────────────────────────────────────
export const V3_FACTORY_ABI = [
  { inputs: [{ name: "tokenA", type: "address" }, { name: "tokenB", type: "address" }, { name: "fee", type: "uint24" }], name: "createPool", outputs: [{ name: "pool", type: "address" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "fee", type: "uint24" }, { name: "tickSpacing", type: "int24" }], name: "enableFeeAmount", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "", type: "uint24" }], name: "feeAmountTickSpacing", outputs: [{ type: "int24" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "address" }, { name: "", type: "address" }, { name: "", type: "uint24" }], name: "getPool", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "owner", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "parameters", outputs: [{ name: "factory", type: "address" }, { name: "token0", type: "address" }, { name: "token1", type: "address" }, { name: "fee", type: "uint24" }, { name: "tickSpacing", type: "int24" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_owner", type: "address" }], name: "setOwner", outputs: [], stateMutability: "nonpayable", type: "function" },
  { anonymous: false, inputs: [{ indexed: true, name: "fee", type: "uint24" }, { indexed: true, name: "tickSpacing", type: "int24" }], name: "FeeAmountEnabled", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "oldOwner", type: "address" }, { indexed: true, name: "newOwner", type: "address" }], name: "OwnerChanged", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "token0", type: "address" }, { indexed: true, name: "token1", type: "address" }, { indexed: true, name: "fee", type: "uint24" }, { indexed: false, name: "tickSpacing", type: "int24" }, { indexed: false, name: "pool", type: "address" }], name: "PoolCreated", type: "event" },
] as const;

// ── Uniswap V3 SwapRouter ─────────────────────────────────────────────────────
export const V3_SWAP_ROUTER_ABI = [
  { inputs: [], name: "WETH9", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "factory", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ components: [{ name: "path", type: "bytes" }, { name: "recipient", type: "address" }, { name: "deadline", type: "uint256" }, { name: "amountIn", type: "uint256" }, { name: "amountOutMinimum", type: "uint256" }], internalType: "struct ISwapRouter.ExactInputParams", name: "params", type: "tuple" }], name: "exactInput", outputs: [{ name: "amountOut", type: "uint256" }], stateMutability: "payable", type: "function" },
  { inputs: [{ components: [{ name: "tokenIn", type: "address" }, { name: "tokenOut", type: "address" }, { name: "fee", type: "uint24" }, { name: "recipient", type: "address" }, { name: "deadline", type: "uint256" }, { name: "amountIn", type: "uint256" }, { name: "amountOutMinimum", type: "uint256" }, { name: "sqrtPriceLimitX96", type: "uint160" }], internalType: "struct ISwapRouter.ExactInputSingleParams", name: "params", type: "tuple" }], name: "exactInputSingle", outputs: [{ name: "amountOut", type: "uint256" }], stateMutability: "payable", type: "function" },
  { inputs: [{ components: [{ name: "path", type: "bytes" }, { name: "recipient", type: "address" }, { name: "deadline", type: "uint256" }, { name: "amountOut", type: "uint256" }, { name: "amountInMaximum", type: "uint256" }], internalType: "struct ISwapRouter.ExactOutputParams", name: "params", type: "tuple" }], name: "exactOutput", outputs: [{ name: "amountIn", type: "uint256" }], stateMutability: "payable", type: "function" },
  { inputs: [{ components: [{ name: "tokenIn", type: "address" }, { name: "tokenOut", type: "address" }, { name: "fee", type: "uint24" }, { name: "recipient", type: "address" }, { name: "deadline", type: "uint256" }, { name: "amountOut", type: "uint256" }, { name: "amountInMaximum", type: "uint256" }, { name: "sqrtPriceLimitX96", type: "uint160" }], internalType: "struct ISwapRouter.ExactOutputSingleParams", name: "params", type: "tuple" }], name: "exactOutputSingle", outputs: [{ name: "amountIn", type: "uint256" }], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "data", type: "bytes[]" }], name: "multicall", outputs: [{ name: "results", type: "bytes[]" }], stateMutability: "payable", type: "function" },
  { inputs: [], name: "refundETH", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "token", type: "address" }, { name: "value", type: "uint256" }, { name: "deadline", type: "uint256" }, { name: "v", type: "uint8" }, { name: "r", type: "bytes32" }, { name: "s", type: "bytes32" }], name: "selfPermit", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "token", type: "address" }, { name: "amountMinimum", type: "uint256" }, { name: "recipient", type: "address" }], name: "sweepToken", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "amountMinimum", type: "uint256" }, { name: "recipient", type: "address" }], name: "unwrapWETH9", outputs: [], stateMutability: "payable", type: "function" },
] as const;

// ── Uniswap V3 QuoterV2 ───────────────────────────────────────────────────────
export const QUOTER_V2_ABI = [
  { inputs: [], name: "WETH9", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "factory", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "path", type: "bytes" }, { name: "amountIn", type: "uint256" }], name: "quoteExactInput", outputs: [{ name: "amountOut", type: "uint256" }, { name: "sqrtPriceX96AfterList", type: "uint160[]" }, { name: "initializedTicksCrossedList", type: "uint32[]" }, { name: "gasEstimate", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ components: [{ name: "tokenIn", type: "address" }, { name: "tokenOut", type: "address" }, { name: "amountIn", type: "uint256" }, { name: "fee", type: "uint24" }, { name: "sqrtPriceLimitX96", type: "uint160" }], name: "params", type: "tuple" }], name: "quoteExactInputSingle", outputs: [{ name: "amountOut", type: "uint256" }, { name: "sqrtPriceX96After", type: "uint160" }, { name: "initializedTicksCrossed", type: "uint32" }, { name: "gasEstimate", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "path", type: "bytes" }, { name: "amountOut", type: "uint256" }], name: "quoteExactOutput", outputs: [{ name: "amountIn", type: "uint256" }, { name: "sqrtPriceX96AfterList", type: "uint160[]" }, { name: "initializedTicksCrossedList", type: "uint32[]" }, { name: "gasEstimate", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ components: [{ name: "tokenIn", type: "address" }, { name: "tokenOut", type: "address" }, { name: "amount", type: "uint256" }, { name: "fee", type: "uint24" }, { name: "sqrtPriceLimitX96", type: "uint160" }], name: "params", type: "tuple" }], name: "quoteExactOutputSingle", outputs: [{ name: "amountIn", type: "uint256" }, { name: "sqrtPriceX96After", type: "uint160" }, { name: "initializedTicksCrossed", type: "uint32" }, { name: "gasEstimate", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
] as const;

// ── Uniswap V3 NonfungiblePositionManager ─────────────────────────────────────
export const NONFUNGIBLE_POSITION_MANAGER_ABI = [
  { inputs: [], name: "DOMAIN_SEPARATOR", outputs: [{ type: "bytes32" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "PERMIT_TYPEHASH", outputs: [{ type: "bytes32" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "WETH9", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "baseURI", outputs: [{ type: "string" }], stateMutability: "pure", type: "function" },
  { inputs: [], name: "factory", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "name", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "symbol", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalSupply", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "to", type: "address" }, { name: "tokenId", type: "uint256" }], name: "approve", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "owner", type: "address" }], name: "balanceOf", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "tokenId", type: "uint256" }], name: "burn", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ components: [{ name: "tokenId", type: "uint256" }, { name: "recipient", type: "address" }, { name: "amount0Max", type: "uint128" }, { name: "amount1Max", type: "uint128" }], name: "params", type: "tuple" }], name: "collect", outputs: [{ name: "amount0", type: "uint256" }, { name: "amount1", type: "uint256" }], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "token0", type: "address" }, { name: "token1", type: "address" }, { name: "fee", type: "uint24" }, { name: "sqrtPriceX96", type: "uint160" }], name: "createAndInitializePoolIfNecessary", outputs: [{ name: "pool", type: "address" }], stateMutability: "payable", type: "function" },
  { inputs: [{ components: [{ name: "tokenId", type: "uint256" }, { name: "liquidity", type: "uint128" }, { name: "amount0Min", type: "uint256" }, { name: "amount1Min", type: "uint256" }, { name: "deadline", type: "uint256" }], name: "params", type: "tuple" }], name: "decreaseLiquidity", outputs: [{ name: "amount0", type: "uint256" }, { name: "amount1", type: "uint256" }], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "tokenId", type: "uint256" }], name: "getApproved", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ components: [{ name: "tokenId", type: "uint256" }, { name: "amount0Desired", type: "uint256" }, { name: "amount1Desired", type: "uint256" }, { name: "amount0Min", type: "uint256" }, { name: "amount1Min", type: "uint256" }, { name: "deadline", type: "uint256" }], name: "params", type: "tuple" }], name: "increaseLiquidity", outputs: [{ name: "liquidity", type: "uint128" }, { name: "amount0", type: "uint256" }, { name: "amount1", type: "uint256" }], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "owner", type: "address" }, { name: "operator", type: "address" }], name: "isApprovedForAll", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ components: [{ name: "token0", type: "address" }, { name: "token1", type: "address" }, { name: "fee", type: "uint24" }, { name: "tickLower", type: "int24" }, { name: "tickUpper", type: "int24" }, { name: "amount0Desired", type: "uint256" }, { name: "amount1Desired", type: "uint256" }, { name: "amount0Min", type: "uint256" }, { name: "amount1Min", type: "uint256" }, { name: "recipient", type: "address" }, { name: "deadline", type: "uint256" }], name: "params", type: "tuple" }], name: "mint", outputs: [{ name: "tokenId", type: "uint256" }, { name: "liquidity", type: "uint128" }, { name: "amount0", type: "uint256" }, { name: "amount1", type: "uint256" }], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "data", type: "bytes[]" }], name: "multicall", outputs: [{ name: "results", type: "bytes[]" }], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "tokenId", type: "uint256" }], name: "ownerOf", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "spender", type: "address" }, { name: "tokenId", type: "uint256" }, { name: "deadline", type: "uint256" }, { name: "v", type: "uint8" }, { name: "r", type: "bytes32" }, { name: "s", type: "bytes32" }], name: "permit", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "tokenId", type: "uint256" }], name: "positions", outputs: [{ name: "nonce", type: "uint96" }, { name: "operator", type: "address" }, { name: "token0", type: "address" }, { name: "token1", type: "address" }, { name: "fee", type: "uint24" }, { name: "tickLower", type: "int24" }, { name: "tickUpper", type: "int24" }, { name: "liquidity", type: "uint128" }, { name: "feeGrowthInside0LastX128", type: "uint256" }, { name: "feeGrowthInside1LastX128", type: "uint256" }, { name: "tokensOwed0", type: "uint128" }, { name: "tokensOwed1", type: "uint128" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "refundETH", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "tokenId", type: "uint256" }], name: "safeTransferFrom", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "tokenId", type: "uint256" }, { name: "_data", type: "bytes" }], name: "safeTransferFrom", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "operator", type: "address" }, { name: "approved", type: "bool" }], name: "setApprovalForAll", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "interfaceId", type: "bytes4" }], name: "supportsInterface", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "token", type: "address" }, { name: "amountMinimum", type: "uint256" }, { name: "recipient", type: "address" }], name: "sweepToken", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "index", type: "uint256" }], name: "tokenByIndex", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "owner", type: "address" }, { name: "index", type: "uint256" }], name: "tokenOfOwnerByIndex", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "tokenId", type: "uint256" }], name: "tokenURI", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "tokenId", type: "uint256" }], name: "transferFrom", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "amount0Owed", type: "uint256" }, { name: "amount1Owed", type: "uint256" }, { name: "data", type: "bytes" }], name: "uniswapV3MintCallback", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "amountMinimum", type: "uint256" }, { name: "recipient", type: "address" }], name: "unwrapWETH9", outputs: [], stateMutability: "payable", type: "function" },
  { anonymous: false, inputs: [{ indexed: true, name: "owner", type: "address" }, { indexed: true, name: "approved", type: "address" }, { indexed: true, name: "tokenId", type: "uint256" }], name: "Approval", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "owner", type: "address" }, { indexed: true, name: "operator", type: "address" }, { indexed: false, name: "approved", type: "bool" }], name: "ApprovalForAll", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "tokenId", type: "uint256" }, { indexed: false, name: "recipient", type: "address" }, { indexed: false, name: "amount0", type: "uint256" }, { indexed: false, name: "amount1", type: "uint256" }], name: "Collect", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "tokenId", type: "uint256" }, { indexed: false, name: "liquidity", type: "uint128" }, { indexed: false, name: "amount0", type: "uint256" }, { indexed: false, name: "amount1", type: "uint256" }], name: "DecreaseLiquidity", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "tokenId", type: "uint256" }, { indexed: false, name: "liquidity", type: "uint128" }, { indexed: false, name: "amount0", type: "uint256" }, { indexed: false, name: "amount1", type: "uint256" }], name: "IncreaseLiquidity", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "from", type: "address" }, { indexed: true, name: "to", type: "address" }, { indexed: true, name: "tokenId", type: "uint256" }], name: "Transfer", type: "event" },
] as const;

// ── TokenLockerManagerV1 ──────────────────────────────────────────────────────
export const TOKEN_LOCKER_MANAGER_ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  { inputs: [], name: "LpLockerFee", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "TokenLockerFee", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "lpAddress_", type: "address" }, { name: "amount_", type: "uint256" }, { name: "unlockTime_", type: "uint40" }], name: "createLpLocker", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "tokenAddress_", type: "address" }, { name: "amount_", type: "uint256" }, { name: "unlockTime_", type: "uint40" }], name: "createTokenLocker", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [], name: "creationEnabled", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "feeWallet", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "id_", type: "uint40" }], name: "getLpData", outputs: [{ name: "hasLpData", type: "bool" }, { name: "id", type: "uint40" }, { name: "token0", type: "address" }, { name: "token1", type: "address" }, { name: "balance0", type: "uint256" }, { name: "balance1", type: "uint256" }, { name: "price0", type: "uint256" }, { name: "price1", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "id_", type: "uint40" }], name: "getLpLockAddress", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "id_", type: "uint40" }], name: "getLpLockData", outputs: [{ name: "isLpToken", type: "bool" }, { name: "id", type: "uint40" }, { name: "contractAddress", type: "address" }, { name: "lockOwner", type: "address" }, { name: "token", type: "address" }, { name: "createdBy", type: "address" }, { name: "createdAt", type: "uint40" }, { name: "blockTime", type: "uint40" }, { name: "unlockTime", type: "uint40" }, { name: "balance", type: "uint256" }, { name: "totalSupply", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "address_", type: "address" }], name: "getLpLockersForAddress", outputs: [{ type: "uint40[]" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "id_", type: "uint40" }], name: "getTokenLockAddress", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "id_", type: "uint40" }], name: "getTokenLockData", outputs: [{ name: "isLpToken", type: "bool" }, { name: "id", type: "uint40" }, { name: "contractAddress", type: "address" }, { name: "lockOwner", type: "address" }, { name: "token", type: "address" }, { name: "createdBy", type: "address" }, { name: "createdAt", type: "uint40" }, { name: "blockTime", type: "uint40" }, { name: "unlockTime", type: "uint40" }, { name: "balance", type: "uint256" }, { name: "totalSupply", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "address_", type: "address" }], name: "getTokenLockersForAddress", outputs: [{ type: "uint40[]" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "lpLockerCount", outputs: [{ type: "uint40" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "id_", type: "uint40" }, { name: "newOwner_", type: "address" }, { name: "previousOwner_", type: "address" }, { name: "createdBy_", type: "address" }], name: "notifyLpLockerOwnerChange", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "id_", type: "uint40" }, { name: "newOwner_", type: "address" }, { name: "previousOwner_", type: "address" }, { name: "createdBy_", type: "address" }], name: "notifyTokenLockerOwnerChange", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "owner", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "value_", type: "bool" }], name: "setCreationEnabled", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_newWallet", type: "address" }], name: "setFeeWallet", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_amount", type: "uint256" }], name: "setLpLockerFee", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_amount", type: "uint256" }], name: "setTokenLockerFee", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "tokenLockerCount", outputs: [{ type: "uint40" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "newOwner_", type: "address" }], name: "transferOwnership", outputs: [], stateMutability: "nonpayable", type: "function" },
  { anonymous: false, inputs: [{ indexed: false, name: "id", type: "uint40" }, { indexed: true, name: "token", type: "address" }, { indexed: true, name: "token0", type: "address" }, { indexed: true, name: "token1", type: "address" }, { indexed: false, name: "createdBy", type: "address" }, { indexed: false, name: "balance", type: "uint256" }, { indexed: false, name: "unlockTime", type: "uint40" }], name: "LpLockerCreated", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "oldOwner", type: "address" }, { indexed: true, name: "newOwner", type: "address" }], name: "OwnershipTransferred", type: "event" },
  { anonymous: false, inputs: [{ indexed: false, name: "id", type: "uint40" }, { indexed: true, name: "token", type: "address" }, { indexed: false, name: "createdBy", type: "address" }, { indexed: false, name: "balance", type: "uint256" }, { indexed: false, name: "unlockTime", type: "uint40" }], name: "TokenLockerCreated", type: "event" },
  { stateMutability: "payable", type: "receive" },
] as const;

// ── TokenLockerV1 (individual locker contract) ─────────────────────────────────
export const TOKEN_LOCKER_V1_ABI = [
  { inputs: [{ name: "amount_", type: "uint256" }, { name: "newUnlockTime_", type: "uint40" }], name: "deposit", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "getIsLpToken", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getLockData", outputs: [{ name: "isLpToken", type: "bool" }, { name: "id", type: "uint40" }, { name: "contractAddress", type: "address" }, { name: "lockOwner", type: "address" }, { name: "token", type: "address" }, { name: "createdBy", type: "address" }, { name: "createdAt", type: "uint40" }, { name: "blockTime", type: "uint40" }, { name: "unlockTime", type: "uint40" }, { name: "balance", type: "uint256" }, { name: "totalSupply", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getLpData", outputs: [{ name: "hasLpData", type: "bool" }, { name: "id", type: "uint40" }, { name: "token0", type: "address" }, { name: "token1", type: "address" }, { name: "balance0", type: "uint256" }, { name: "balance1", type: "uint256" }, { name: "price0", type: "uint256" }, { name: "price1", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "owner", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "newOwner_", type: "address" }], name: "transferOwnership", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "withdraw", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "withdrawEth", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "address_", type: "address" }], name: "withdrawToken", outputs: [], stateMutability: "nonpayable", type: "function" },
  { anonymous: false, inputs: [{ indexed: false, name: "amount", type: "uint256" }], name: "Deposited", type: "event" },
  { anonymous: false, inputs: [{ indexed: false, name: "newUnlockTime", type: "uint40" }], name: "Extended", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "oldOwner", type: "address" }, { indexed: true, name: "newOwner", type: "address" }], name: "OwnershipTransferred", type: "event" },
  { anonymous: false, inputs: [], name: "Withdrew", type: "event" },
  { stateMutability: "payable", type: "receive" },
] as const;

// Keep legacy aliases
export const TOKEN_LOCKER_ABI = TOKEN_LOCKER_MANAGER_ABI;
export const LP_LOCKER_ABI = TOKEN_LOCKER_MANAGER_ABI;

// ── JinkFarm ──────────────────────────────────────────────────────────────────
export const FARM_ABI = [
  { inputs: [], name: "endTime", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "massUpdatePools", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "owner", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "poolLength", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "renounceOwnership", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "rewardPerSecond", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "rewardToken", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "startTime", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalAllocPoint", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "allocPoint", type: "uint256" }, { name: "lpToken", type: "address" }, { name: "withUpdate", type: "bool" }], name: "addPool", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_pid", type: "uint256" }, { name: "_amount", type: "uint256" }], name: "deposit", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "amount", type: "uint256" }], name: "fund", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_pid", type: "uint256" }], name: "harvest", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_pid", type: "uint256" }, { name: "_user", type: "address" }], name: "pendingReward", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "uint256" }], name: "poolInfo", outputs: [{ name: "lpToken", type: "address" }, { name: "allocPoint", type: "uint256" }, { name: "lastRewardTime", type: "uint256" }, { name: "accRewardPerShare", type: "uint256" }, { name: "totalDeposited", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "token", type: "address" }, { name: "amount", type: "uint256" }], name: "rescueTokens", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "pid", type: "uint256" }, { name: "allocPoint", type: "uint256" }, { name: "withUpdate", type: "bool" }], name: "setPool", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "newRate", type: "uint256" }], name: "setRewardPerSecond", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "newOwner", type: "address" }], name: "transferOwnership", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "pid", type: "uint256" }], name: "updatePool", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_pid", type: "uint256" }, { name: "_user", type: "address" }], name: "userInfo", outputs: [{ name: "amount", type: "uint256" }, { name: "rewardDebt", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_pid", type: "uint256" }, { name: "_amount", type: "uint256" }], name: "withdraw", outputs: [], stateMutability: "nonpayable", type: "function" },
  { anonymous: false, inputs: [{ indexed: true, name: "user", type: "address" }, { indexed: true, name: "pid", type: "uint256" }, { indexed: false, name: "amount", type: "uint256" }], name: "Deposit", type: "event" },
  { anonymous: false, inputs: [{ indexed: false, name: "amount", type: "uint256" }, { indexed: false, name: "newEndTime", type: "uint256" }], name: "Funded", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "user", type: "address" }, { indexed: true, name: "pid", type: "uint256" }, { indexed: false, name: "reward", type: "uint256" }], name: "Harvest", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "previousOwner", type: "address" }, { indexed: true, name: "newOwner", type: "address" }], name: "OwnershipTransferred", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "pid", type: "uint256" }, { indexed: true, name: "lpToken", type: "address" }, { indexed: false, name: "allocPoint", type: "uint256" }], name: "PoolAdded", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "pid", type: "uint256" }, { indexed: false, name: "allocPoint", type: "uint256" }], name: "PoolUpdated", type: "event" },
  { anonymous: false, inputs: [{ indexed: false, name: "newRate", type: "uint256" }], name: "RewardRateUpdated", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "user", type: "address" }, { indexed: true, name: "pid", type: "uint256" }, { indexed: false, name: "amount", type: "uint256" }], name: "Withdraw", type: "event" },
] as const;

// ── Contract addresses by chain ───────────────────────────────────────────────
export const CONTRACT_ADDRESSES: Record<number, {
  router: `0x${string}`;
  factory: `0x${string}`;
  lockerManager?: `0x${string}`;
  farm?: `0x${string}`;
  v3Factory?: `0x${string}`;
  nonfungiblePositionManager?: `0x${string}`;
  v3SwapRouter?: `0x${string}`;
  universalRouter?: `0x${string}`;
  quoterV2?: `0x${string}`;
  weth9?: `0x${string}`;
}> = {
  11155111: { // Sepolia — JinkFi deployment
    router:                     "0x01faa5159FC0d9103efC0E8274fBD36D4f2e12DE",
    factory:                    "0x4Ad76DCe86BecEBC48Aba2f4dD0F685D6C3B7430",
    lockerManager:              "0x9EE61392636ab192537DE1D6541056bc2aDFCF8F",
    farm:                       "0x7Be64D4d66a2e24D83A8BA373ff8478220b9DA09",
    v3Factory:                  "0xD156649d5B844d9a72cF157c645c9aB0E016ccaf",
    nonfungiblePositionManager: "0x582787a17A0cf0fdbf893771739E8C150446692e",
    v3SwapRouter:               "0x0e2B6BE041806391534B18AD2AE1548d8AA088C4",
    universalRouter:            "0xA1E608E29016430a486A88a2Da719DDdBdA054bC",
    quoterV2:                   "0xa4E0c4Fc04B3786bE5687B70Be9c5abEEae2d51f",
  },
  4217: { // Tempo Mainnet — JinkFi deployment 2026-04-04
    router:                     "0xd74136ec9100303861B08b809fEAbC333611dA66",
    factory:                    "0xd8db8b03281ee11DF78944772778843C54814913",
    lockerManager:              "0x95a8762DbE991d8c2a33aa056A55837CA3FeF30E",
    farm:                       "0x8d100056891a2D80A2aecf1fd7aaE14c6Aa3e916",
    v3Factory:                  "0x28b25620F0956f509Bd0E07ED9D9Ad53725D2752",
    nonfungiblePositionManager: "0x6535b354cEAD3739a6403D84E679F6d537039052",
    v3SwapRouter:               "0xCdBF78b0c7e4428093Fe60973E9379D5BcFe1BBB",
    universalRouter:            "0x7482240897747fE08E0aAf80A8C83081B6cce67A",
    quoterV2:                   "0x1EB1AF14374F61B30b2D96841c6F48d473aa1b8c",
    weth9:                      "0xE657646165f00907e8cBcFE5aDB8A6F5cdc5f454",
  },
};
