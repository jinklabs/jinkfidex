export interface Market {
  symbol: string;
  baseToken: string;
  indexToken: string;
  markPrice: number;
  indexPrice: number;
  fundingRate8h: number; // % per 8h (positive = longs pay shorts)
  openInterestLong: number;  // USD
  openInterestShort: number; // USD
  maxLeverage: number;
  minCollateralUSD: number;
  liquidationFeeUSD: number;
  availableLiquidityLong: number;
  availableLiquidityShort: number;
}

export interface Position {
  id: string;
  market: string;
  side: "long" | "short";
  collateralUSD: number;
  sizeUSD: number;
  leverage: number;
  entryPrice: number;
  markPrice: number;
  liquidationPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  fundingFee: number;
  openedAt: number;
}

export interface Order {
  id: string;
  market: string;
  side: "long" | "short";
  type: "market" | "limit" | "stop";
  sizeUSD: number;
  triggerPrice?: number;
  collateralUSD: number;
  leverage: number;
  status: "open" | "filled" | "cancelled";
  createdAt: number;
}

export const PERP_MARKETS: Market[] = [
  {
    symbol: "BTC-USD", baseToken: "WBTC", indexToken: "BTC",
    markPrice: 0, indexPrice: 0,
    fundingRate8h: 0, openInterestLong: 0, openInterestShort: 0,
    maxLeverage: 100, minCollateralUSD: 10, liquidationFeeUSD: 5,
    availableLiquidityLong: 0, availableLiquidityShort: 0,
  },
  {
    symbol: "ETH-USD", baseToken: "WETH", indexToken: "ETH",
    markPrice: 0, indexPrice: 0,
    fundingRate8h: 0, openInterestLong: 0, openInterestShort: 0,
    maxLeverage: 50, minCollateralUSD: 10, liquidationFeeUSD: 5,
    availableLiquidityLong: 0, availableLiquidityShort: 0,
  },
  {
    symbol: "SOL-USD", baseToken: "SOL", indexToken: "SOL",
    markPrice: 0, indexPrice: 0,
    fundingRate8h: 0, openInterestLong: 0, openInterestShort: 0,
    maxLeverage: 25, minCollateralUSD: 10, liquidationFeeUSD: 5,
    availableLiquidityLong: 0, availableLiquidityShort: 0,
  },
  {
    symbol: "ARB-USD", baseToken: "ARB", indexToken: "ARB",
    markPrice: 0, indexPrice: 0,
    fundingRate8h: 0, openInterestLong: 0, openInterestShort: 0,
    maxLeverage: 20, minCollateralUSD: 10, liquidationFeeUSD: 5,
    availableLiquidityLong: 0, availableLiquidityShort: 0,
  },
  {
    symbol: "LINK-USD", baseToken: "LINK", indexToken: "LINK",
    markPrice: 0, indexPrice: 0,
    fundingRate8h: 0, openInterestLong: 0, openInterestShort: 0,
    maxLeverage: 20, minCollateralUSD: 10, liquidationFeeUSD: 5,
    availableLiquidityLong: 0, availableLiquidityShort: 0,
  },
];

// Maps Market.symbol → Binance WebSocket / REST symbol
export const MARKET_FEED_KEY: Record<string, string> = {
  "BTC-USD":  "BTCUSDT",
  "ETH-USD":  "ETHUSDT",
  "SOL-USD":  "SOLUSDT",
  "ARB-USD":  "ARBUSDT",
  "LINK-USD": "LINKUSDT",
};

export function calcLiquidationPrice(
  side: "long" | "short",
  entryPrice: number,
  leverage: number,
  liquidationFeeUSD: number,
  sizeUSD: number
): number {
  const maintenanceMarginRate = 0.005; // 0.5%
  const collateral = sizeUSD / leverage;
  const liqThreshold = collateral - liquidationFeeUSD - (sizeUSD * maintenanceMarginRate);
  if (side === "long") {
    return entryPrice * (1 - liqThreshold / sizeUSD);
  } else {
    return entryPrice * (1 + liqThreshold / sizeUSD);
  }
}

export function calcPnl(side: "long" | "short", entryPrice: number, markPrice: number, sizeUSD: number): number {
  if (side === "long") return sizeUSD * (markPrice - entryPrice) / entryPrice;
  return sizeUSD * (entryPrice - markPrice) / entryPrice;
}

export function fmtUSD(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}
