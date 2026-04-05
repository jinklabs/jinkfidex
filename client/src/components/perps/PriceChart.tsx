import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  ColorType,
  CrosshairMode,
} from "lightweight-charts";
import type { Market } from "../../lib/perps";
import { MARKET_FEED_KEY } from "../../lib/perps";
import { useFeed } from "../../context/PriceFeedContext";

const PERIODS = ["1H", "4H", "1D", "1W", "1M"] as const;
type Period = typeof PERIODS[number];

interface BinanceInterval { interval: string; limit: number; }
const BINANCE_CONFIG: Record<Period, BinanceInterval> = {
  "1H": { interval: "5m",  limit: 12  },
  "4H": { interval: "15m", limit: 16  },
  "1D": { interval: "1h",  limit: 24  },
  "1W": { interval: "4h",  limit: 42  },
  "1M": { interval: "1d",  limit: 30  },
};

interface Props { market: Market; }

export default function PriceChart({ market }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const seriesRef    = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [period, setPeriod] = useState<Period>("1H");

  const feed = useFeed();
  const feedKey  = MARKET_FEED_KEY[market.symbol];
  const liveData = feed[feedKey];

  const livePrice     = liveData?.price        ?? market.markPrice;
  const changePct     = liveData?.changePct24h ?? 0;
  const high24h       = liveData?.high24h       ?? market.markPrice * 1.032;
  const low24h        = liveData?.low24h        ?? market.markPrice * 0.971;
  const volumeUSD24h  = liveData?.volumeUSD24h  ?? Math.abs(market.openInterestLong + market.openInterestShort) / 10;

  // Initialise chart once
  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6b82a0",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(22,36,64,0.6)" },
        horzLines: { color: "rgba(22,36,64,0.6)" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "rgba(22,36,64,0.8)", textColor: "#6b82a0" },
      timeScale: { borderColor: "rgba(22,36,64,0.8)", timeVisible: true, secondsVisible: false },
      handleScroll: true,
      handleScale: true,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor:         "#4ade80",
      downColor:       "#f87171",
      borderUpColor:   "#4ade80",
      borderDownColor: "#f87171",
      wickUpColor:     "#4ade80",
      wickDownColor:   "#f87171",
    });

    chartRef.current  = chart;
    seriesRef.current = series;

    const ro = new ResizeObserver(() => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    });
    ro.observe(containerRef.current);

    return () => { ro.disconnect(); chart.remove(); };
  }, []);

  // Fetch real klines from Binance; fall back to generated data
  useEffect(() => {
    if (!seriesRef.current) return;
    const { interval, limit } = BINANCE_CONFIG[period];
    const binanceSymbol = feedKey ?? market.symbol.replace("-USD", "USDT");

    fetch(`https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`)
      .then(r => {
        if (!r.ok) throw new Error("non-ok");
        return r.json() as Promise<[number, string, string, string, string, ...unknown[]][]>;
      })
      .then(data => {
        const candles: CandlestickData[] = data.map(k => ({
          time:  Math.floor(k[0] / 1000) as unknown as CandlestickData["time"],
          open:  parseFloat(k[1]),
          high:  parseFloat(k[2]),
          low:   parseFloat(k[3]),
          close: parseFloat(k[4]),
        }));
        seriesRef.current?.setData(candles);
        chartRef.current?.timeScale().fitContent();
      })
      .catch(() => {
        seriesRef.current?.setData([]);
      });
  }, [market.symbol, period, feedKey, market.markPrice]);

  // Update the most recent candle's close with live WS price
  useEffect(() => {
    if (!seriesRef.current || !liveData) return;
    const now = Math.floor(Date.now() / 1000);
    seriesRef.current.update({
      time:  now as unknown as CandlestickData["time"],
      open:  liveData.open24h,
      high:  liveData.high24h,
      low:   liveData.low24h,
      close: liveData.price,
    });
  }, [liveData?.price]);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ background: "rgba(11,21,39,0.85)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 1rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <span style={{ fontWeight: 800, fontSize: 22 }}>
            ${livePrice.toLocaleString(undefined, { minimumFractionDigits: livePrice < 10 ? 4 : 2 })}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: changePct >= 0 ? "var(--neon)" : "#f87171" }}>
            {changePct >= 0 ? "+" : ""}{changePct.toFixed(2)}%
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Index: ${market.indexPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          {!liveData && (
            <span style={{ fontSize: 10, color: "var(--text-muted)", opacity: 0.6 }}>connecting…</span>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.2rem" }}>
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{ padding: "0.25rem 0.6rem", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: period === p ? "var(--accent)" : "transparent", color: period === p ? "#fff" : "var(--text-muted)", boxShadow: period === p ? "0 0 8px var(--accent-glow)" : "none", transition: "all 0.15s" }}
            >{p}</button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div ref={containerRef} style={{ height: 300, width: "100%" }} />

      {/* Stats strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid var(--border)" }}>
        {[
          { label: "24h High",   value: `$${high24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
          { label: "24h Low",    value: `$${low24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
          { label: "24h Volume", value: volumeUSD24h >= 1_000_000_000
              ? `$${(volumeUSD24h / 1_000_000_000).toFixed(2)}B`
              : `$${(volumeUSD24h / 1_000_000).toFixed(0)}M` },
          { label: "Funding 8h", value: `${market.fundingRate8h >= 0 ? "+" : ""}${(market.fundingRate8h * 100).toFixed(4)}%`, color: market.fundingRate8h >= 0 ? "#f97316" : "var(--neon)" },
        ].map((s, i) => (
          <div key={s.label} style={{ padding: "0.55rem 0.85rem", borderRight: i < 3 ? "1px solid var(--border)" : "none" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.label}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: s.color ?? "var(--text)", marginTop: "0.15rem" }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
