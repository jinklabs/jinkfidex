import { useState, useCallback } from "react";
import { PERP_MARKETS, calcLiquidationPrice, calcPnl, type Market, type Position, type Order } from "../lib/perps";

// Simulated perps state — in production this would use GMX/dYdX/Hyperliquid contracts
export function usePerps() {
  const [selectedMarket, setSelectedMarket] = useState<Market>(PERP_MARKETS[0]);
  const [side, setSide] = useState<"long" | "short">("long");
  const [collateral, setCollateral] = useState("");
  const [leverage, setLeverage] = useState(10);
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop">("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders] = useState<Order[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const collateralNum = parseFloat(collateral) || 0;
  const sizeUSD = collateralNum * leverage;
  const entryPrice = orderType === "limit" && limitPrice ? parseFloat(limitPrice) : selectedMarket.markPrice;
  const liqPrice = collateralNum > 0
    ? calcLiquidationPrice(side, entryPrice, leverage, selectedMarket.liquidationFeeUSD, sizeUSD)
    : 0;

  const openPosition = useCallback(async () => {
    if (collateralNum < selectedMarket.minCollateralUSD) {
      setError(`Minimum collateral: $${selectedMarket.minCollateralUSD}`);
      return;
    }
    if (leverage > selectedMarket.maxLeverage) {
      setError(`Max leverage: ${selectedMarket.maxLeverage}x`);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    // Simulate tx delay
    await new Promise(r => setTimeout(r, 1500));
    const newPos: Position = {
      id: crypto.randomUUID(),
      market: selectedMarket.symbol,
      side,
      collateralUSD: collateralNum,
      sizeUSD,
      leverage,
      entryPrice,
      markPrice: selectedMarket.markPrice,
      liquidationPrice: liqPrice,
      unrealizedPnl: 0,
      unrealizedPnlPct: 0,
      fundingFee: 0,
      openedAt: Date.now(),
    };
    setPositions(p => [...p, newPos]);
    setCollateral("");
    setIsSubmitting(false);
  }, [collateralNum, sizeUSD, leverage, side, entryPrice, liqPrice, selectedMarket]);

  const closePosition = useCallback((id: string) => {
    setPositions(p => p.filter(pos => pos.id !== id));
  }, []);

  // Refresh mark prices — uses live prices when provided, otherwise simulates ±0.2% noise
  const refreshPrices = useCallback((livePrices?: Record<string, number>) => {
    setPositions(prev => prev.map(pos => {
      const market = PERP_MARKETS.find(m => m.symbol === pos.market);
      if (!market) return pos;
      const livePrice = livePrices?.[pos.market];
      const markPrice = livePrice ?? market.markPrice;
      const pnl = calcPnl(pos.side, pos.entryPrice, markPrice, pos.sizeUSD);
      return {
        ...pos,
        markPrice,
        unrealizedPnl: pnl,
        unrealizedPnlPct: (pnl / pos.collateralUSD) * 100,
      };
    }));
  }, []);

  return {
    selectedMarket, side, collateral, leverage, orderType, limitPrice,
    sizeUSD, entryPrice, liqPrice,
    positions, orders,
    isSubmitting, error,
    setSelectedMarket, setSide, setCollateral, setLeverage,
    setOrderType, setLimitPrice,
    openPosition, closePosition, refreshPrices,
  };
}
