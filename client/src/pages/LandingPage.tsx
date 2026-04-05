import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftRight, Droplets, TrendingUp, Coins, Layers,
  Lock, Trophy, ArrowRightLeft, Zap, Shield, Users, Activity,
  BarChart2, ChevronRight,
} from "lucide-react";
import { createChart, LineSeries, ColorType } from "lightweight-charts";
import { useFeed } from "../context/PriceFeedContext";
import { useUniswapPools } from "../hooks/useUniswapPools";

// ── Animated counter ──────────────────────────────────────────────────────────

function AnimatedStat({ value, label, prefix = "", suffix = "" }: {
  value: number; label: string; prefix?: string; suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1400;
    const start    = performance.now();
    const raf = (ts: number) => {
      const progress = Math.min((ts - start) / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * ease));
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [value]);

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: 900, fontSize: 26, color: "var(--accent)",
        letterSpacing: "0.04em",
        textShadow: "0 0 20px var(--accent-glow)",
        lineHeight: 1.1,
      }}>
        {prefix}{display.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

// ── Price ticker row ──────────────────────────────────────────────────────────

const TICKER_SYMBOLS = [
  { key: "BTCUSDT", label: "BTC" },
  { key: "ETHUSDT", label: "ETH" },
  { key: "SOLUSDT", label: "SOL" },
  { key: "BNBUSDT", label: "BNB" },
  { key: "LINKUSDT", label: "LINK" },
];

function PriceTicker() {
  const feed = useFeed();
  return (
    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
      {TICKER_SYMBOLS.map(({ key, label }) => {
        const d = feed[key];
        const change = d?.changePct24h ?? 0;
        const isUp   = change >= 0;
        return (
          <div key={key} style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            background: "var(--bg-card)", border: "1px solid var(--border)",
            padding: "0.5rem 0.9rem",
            minWidth: 130,
          }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>{label}/USDT</div>
              <div style={{ fontWeight: 800, fontSize: 15, fontFamily: "'Rajdhani', sans-serif", color: "var(--text)" }}>
                ${d ? d.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}
              </div>
            </div>
            <div style={{
              marginLeft: "auto", fontSize: 10, fontWeight: 700,
              fontFamily: "'Share Tech Mono', monospace",
              color: isUp ? "var(--neon, #00e5a0)" : "#f87171",
            }}>
              {isUp ? "+" : ""}{change.toFixed(2)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── TVL / Volume chart (lightweight-charts area) ──────────────────────────────

function TvlChart() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      width:  containerRef.current.clientWidth,
      height: 150,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor:  "rgba(180,180,180,0.7)",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.03)" },
        horzLines: { color: "rgba(255,255,255,0.03)" },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.06)" },
      timeScale: { borderColor: "rgba(255,255,255,0.06)", timeVisible: true },
      handleScroll: false, handleScale: false,
    });

    const series = chart.addSeries(LineSeries, {
      color: "rgba(212,175,55,0.9)",
      lineWidth: 2,
      lastValueVisible: true,
      priceLineVisible: false,
    });

    const now = Math.floor(Date.now() / 1000);
    const DAY = 86400;
    // Synthetic TVL growth data (60 days)
    const data = Array.from({ length: 60 }, (_, i) => {
      const base   = 12_000_000;
      const growth = i * 280_000;
      const noise  = Math.sin(i * 0.8) * 400_000 + Math.cos(i * 0.3) * 200_000;
      return {
        time:  (now - (59 - i) * DAY) as unknown as import("lightweight-charts").UTCTimestamp,
        value: base + growth + noise,
      };
    });
    series.setData(data);
    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      if (containerRef.current) chart.resize(containerRef.current.clientWidth, 150);
    });
    ro.observe(containerRef.current);
    return () => { ro.disconnect(); chart.remove(); };
  }, []);

  return <div ref={containerRef} style={{ width: "100%" }} />;
}

// ── Pool stats mini bars ──────────────────────────────────────────────────────

function PoolStatsBar() {
  const { data: pools } = useUniswapPools(1);

  const top5 = (pools ?? []).slice(0, 5);
  const maxTvl = Math.max(...top5.map(p => p.tvlUSD), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {top5.map(pool => (
        <div key={pool.id}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "'Share Tech Mono', monospace", color: "var(--text-muted)", marginBottom: 3 }}>
            <span style={{ color: "var(--text)" }}>{pool.token0Symbol}/{pool.token1Symbol}</span>
            <span>${(pool.tvlUSD / 1_000_000).toFixed(1)}M TVL · {pool.apr.toFixed(1)}% APR</span>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${(pool.tvlUSD / maxTvl) * 100}%`,
              background: "linear-gradient(90deg, var(--accent), rgba(212,175,55,0.4))",
              transition: "width 1s ease",
              boxShadow: "0 0 6px var(--accent-glow)",
            }} />
          </div>
        </div>
      ))}
      {top5.length === 0 && (
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
          Loading pool data…
        </div>
      )}
    </div>
  );
}

// ── Feature mini-graphics ─────────────────────────────────────────────────────

function SwapFlow({ color }: { color: string }) {
  return (
    <svg width="100%" height="60" viewBox="0 0 220 60" style={{ overflow: "visible" }}>
      <circle cx="22" cy="30" r="14" fill={`${color}18`} stroke={color} strokeWidth="1.5"/>
      <text x="22" y="34" textAnchor="middle" fill={color} fontSize="8" fontFamily="monospace" fontWeight="700">ETH</text>
      <line x1="37" y1="30" x2="66" y2="14" stroke={`${color}55`} strokeWidth="1" strokeDasharray="3 2"/>
      <line x1="37" y1="30" x2="66" y2="30" stroke={color} strokeWidth="1.5"/>
      <line x1="37" y1="30" x2="66" y2="46" stroke={`${color}55`} strokeWidth="1" strokeDasharray="3 2"/>
      <rect x="66" y="7" width="26" height="14" fill={`${color}15`} stroke={`${color}45`} strokeWidth="1"/>
      <text x="79" y="17" textAnchor="middle" fill={`${color}cc`} fontSize="7.5" fontFamily="monospace">V2</text>
      <rect x="66" y="23" width="26" height="14" fill={`${color}30`} stroke={color} strokeWidth="1"/>
      <text x="79" y="33" textAnchor="middle" fill={color} fontSize="7.5" fontFamily="monospace" fontWeight="700">V3</text>
      <rect x="66" y="39" width="26" height="14" fill={`${color}15`} stroke={`${color}45`} strokeWidth="1"/>
      <text x="79" y="49" textAnchor="middle" fill={`${color}cc`} fontSize="7.5" fontFamily="monospace">V4</text>
      <line x1="94" y1="14" x2="124" y2="30" stroke={`${color}55`} strokeWidth="1" strokeDasharray="3 2"/>
      <line x1="94" y1="30" x2="124" y2="30" stroke={color} strokeWidth="1.5"/>
      <line x1="94" y1="46" x2="124" y2="30" stroke={`${color}55`} strokeWidth="1" strokeDasharray="3 2"/>
      <circle cx="140" cy="30" r="14" fill={`${color}18`} stroke={color} strokeWidth="1.5"/>
      <text x="140" y="34" textAnchor="middle" fill={color} fontSize="7" fontFamily="monospace" fontWeight="700">USDC</text>
      <rect x="162" y="21" width="54" height="14" fill={`${color}22`} stroke={`${color}60`} strokeWidth="1"/>
      <text x="189" y="31" textAnchor="middle" fill={color} fontSize="7" fontFamily="monospace">BEST PRICE ✓</text>
    </svg>
  );
}

function LiquidityBars({ color }: { color: string }) {
  const heights = [6, 10, 18, 32, 52, 58, 46, 26, 14, 8, 5];
  const bw = 15, gap = 3, maxH = 50, svgW = heights.length * (bw + gap);
  const priceIdx = 5;
  const px = priceIdx * (bw + gap) + bw / 2;
  return (
    <svg width="100%" height="68" viewBox={`0 0 ${svgW} 68`} preserveAspectRatio="xMidYMid meet">
      {heights.map((h, i) => (
        <rect key={i} x={i*(bw+gap)} y={maxH-h+4} width={bw} height={h}
          fill={i>=3&&i<=7 ? `${color}45` : `${color}18`}
          stroke={i>=3&&i<=7 ? color : `${color}35`} strokeWidth="1"/>
      ))}
      <line x1={px} y1="2" x2={px} y2={maxH+4} stroke={color} strokeWidth="1.5" strokeDasharray="3 2"/>
      <polygon points={`${px-5},${maxH+4} ${px+5},${maxH+4} ${px},${maxH-3}`} fill={color}/>
      <rect x={px-18} y="0" width="36" height="11" fill={`${color}22`} stroke={`${color}60`} strokeWidth="1"/>
      <text x={px} y="9" textAnchor="middle" fill={color} fontSize="6.5" fontFamily="monospace">CURRENT</text>
      <text x="2" y="65" fill={`${color}66`} fontSize="6.5" fontFamily="monospace">MIN</text>
      <text x={svgW-20} y="65" fill={`${color}66`} fontSize="6.5" fontFamily="monospace">MAX</text>
    </svg>
  );
}

function CandleChart({ color }: { color: string }) {
  const candles = [[30,38,26,42],[38,32,29,43],[32,44,30,47],[44,40,37,50],[40,52,38,55],[52,48,45,57]];
  const G="#4ade80", R="#f87171", cw=14, gap=10, maxH=52, minV=24, rng=33;
  const py=(v:number)=>4+maxH-((v-minV)/rng)*maxH;
  return (
    <svg width="100%" height="68" viewBox="0 0 165 68">
      {candles.map(([o,c,l,h],i)=>{
        const x=i*(cw+gap)+4, up=c>=o, clr=up?G:R;
        const by=Math.min(py(o),py(c)), bh=Math.max(Math.abs(py(o)-py(c)),2);
        return <g key={i}>
          <line x1={x+cw/2} y1={py(h)} x2={x+cw/2} y2={py(l)} stroke={clr} strokeWidth="1.5"/>
          <rect x={x} y={by} width={cw} height={bh} fill={up?`${clr}55`:`${clr}80`} stroke={clr} strokeWidth="1"/>
        </g>;
      })}
      <rect x="112" y="4" width="48" height="17" fill={`${color}22`} stroke={color} strokeWidth="1"/>
      <text x="136" y="16" textAnchor="middle" fill={color} fontSize="11" fontFamily="monospace" fontWeight="900">100×</text>
      <text x="112" y="36" fill={G} fontSize="9" fontFamily="monospace" fontWeight="700">+18.4%</text>
      <text x="112" y="48" fill={`${color}99`} fontSize="6.5" fontFamily="monospace">UNREALISED PnL</text>
      <text x="112" y="60" fill={`${color}66`} fontSize="6.5" fontFamily="monospace">PYTH · CHAINLINK</text>
    </svg>
  );
}

function StakingRing({ color }: { color: string }) {
  const r=24, cx=32, cy=34, pct=0.72, circ=2*Math.PI*r;
  return (
    <svg width="100%" height="68" viewBox="0 0 200 68">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`${color}18`} strokeWidth="5"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${circ*pct} ${circ*(1-pct)}`} strokeDashoffset={circ*0.25}
        style={{filter:`drop-shadow(0 0 5px ${color})`}}/>
      <text x={cx} y={cy-4} textAnchor="middle" fill={color} fontSize="11" fontFamily="monospace" fontWeight="700">72%</text>
      <text x={cx} y={cy+9} textAnchor="middle" fill={`${color}aa`} fontSize="6" fontFamily="monospace">STAKED</text>
      {([["FLEX","8.4%",55],["30D","14.2%",80],["90D","22.7%",110]] as [string,string,number][]).map(([l,a,w],i)=>(
        <g key={l} transform={`translate(68,${8+i*20})`}>
          <text x="0" y="10" fill={`${color}88`} fontSize="7" fontFamily="monospace">{l}</text>
          <rect x="24" y="1" width={w} height="9" fill={`${color}15`} stroke={`${color}25`} strokeWidth="1"/>
          <rect x="24" y="1" width={w} height="9" fill={`${color}42`} style={{clipPath:`inset(0 ${(1-w/110)*100}% 0 0)`}}/>
          <text x={w+28} y="9" fill={color} fontSize="8" fontFamily="monospace" fontWeight="700">{a}</text>
        </g>
      ))}
    </svg>
  );
}

function FarmBars({ color }: { color: string }) {
  const data:number[][] = [[8,2],[12,3],[16,4],[20,6],[26,8],[32,10]];
  const max=42, bw=18, gap=10, mh=48;
  return (
    <svg width="100%" height="68" viewBox="0 0 184 68">
      {data.map(([b,n],i)=>{
        const x=i*(bw+gap)+4, bH=(b/max)*mh, nH=(n/max)*mh;
        return <g key={i}>
          <rect x={x} y={4+mh-bH} width={bw} height={bH} fill={`${color}30`} stroke={`${color}55`} strokeWidth="1"/>
          <rect x={x} y={4+mh-bH-nH} width={bw} height={nH} fill={`${color}65`} stroke={color} strokeWidth="1"
            style={{filter:i===5?`drop-shadow(0 0 4px ${color})`:'none'}}/>
          <text x={x+bw/2} y="63" textAnchor="middle" fill={`${color}66`} fontSize="6.5" fontFamily="monospace">W{i+1}</text>
        </g>;
      })}
      <path d="M4,50 C50,44 100,28 180,6" stroke={color} strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.5"/>
      <rect x="126" y="4" width="54" height="10" fill={`${color}18`} stroke={`${color}35`} strokeWidth="1"/>
      <text x="153" y="12" textAnchor="middle" fill={`${color}99`} fontSize="6.5" fontFamily="monospace">BONUS REWARDS</text>
      <rect x="126" y="18" width="54" height="10" fill={`${color}10`} stroke={`${color}25`} strokeWidth="1"/>
      <text x="153" y="26" textAnchor="middle" fill={`${color}66`} fontSize="6.5" fontFamily="monospace">BASE REWARDS</text>
    </svg>
  );
}

function LockerViz({ color }: { color: string }) {
  const segs = [{l:"7D",p:.15},{l:"30D",p:.35},{l:"90D",p:.30},{l:"1Y",p:.20}];
  let cum=0; const tw=140;
  return (
    <svg width="100%" height="68" viewBox="0 0 200 68">
      <rect x="8" y="24" width="26" height="22" rx="2" fill={`${color}18`} stroke={color} strokeWidth="1.5"/>
      <path d="M12 24 Q21 13 30 24" fill="none" stroke={color} strokeWidth="1.5"/>
      <circle cx="21" cy="35" r="4" fill={color} opacity="0.85"/>
      <rect x="20" y="35" width="2" height="7" fill={color} opacity="0.85"/>
      <text x="44" y="12" fill={`${color}88`} fontSize="7" fontFamily="monospace">LOCK DISTRIBUTION</text>
      {segs.map(({l,p})=>{
        const w=tw*p, x=44+cum, op=Math.round(18+p*55).toString(16).padStart(2,'0');
        cum+=w;
        return <g key={l}>
          <rect x={x} y={16} width={w-1} height={16} fill={`${color}${op}`} stroke={`${color}55`} strokeWidth="1"/>
          <text x={x+w/2} y="28" textAnchor="middle" fill={color} fontSize="7" fontFamily="monospace">{l}</text>
        </g>;
      })}
      <text x="44" y="48" fill={`${color}88`} fontSize="7" fontFamily="monospace">TOTAL VALUE LOCKED</text>
      <rect x="44" y="52" width="148" height="9" fill={`${color}15`} stroke={`${color}28`} strokeWidth="1"/>
      <rect x="44" y="52" width="104" height="9" fill={`${color}50`}/>
      <text x="196" y="60" fill={color} fontSize="7" fontFamily="monospace">70%</text>
    </svg>
  );
}

function QuestBars({ color }: { color: string }) {
  const qs:([string,number])[] = [["SWAP",85],["BRIDGE",42],["STAKE",67],["SOCIAL",30]];
  return (
    <svg width="100%" height="68" viewBox="0 0 200 68">
      <circle cx="26" cy="26" r="22" fill={`${color}15`} stroke={color} strokeWidth="1.5"
        style={{filter:`drop-shadow(0 0 6px ${color}66)`}}/>
      <text x="26" y="21" textAnchor="middle" fill={`${color}cc`} fontSize="8" fontFamily="monospace">LVL</text>
      <text x="26" y="36" textAnchor="middle" fill={color} fontSize="16" fontFamily="monospace" fontWeight="900">7</text>
      {qs.map(([n,xp],i)=>(
        <g key={n} transform={`translate(58,${4+i*15})`}>
          <text x="0" y="10" fill={`${color}88`} fontSize="7" fontFamily="monospace">{n}</text>
          <rect x="34" y="2" width="96" height="8" fill={`${color}15`} stroke={`${color}22`} strokeWidth="1"/>
          <rect x="34" y="2" width={xp*96/100} height="8" fill={`${color}55`}
            style={{filter:xp>80?`drop-shadow(0 0 3px ${color})`:'none'}}/>
          <text x="134" y="10" fill={color} fontSize="7" fontFamily="monospace">{xp}%</text>
        </g>
      ))}
      <text x="58" y="66" fill={`${color}77`} fontSize="6.5" fontFamily="monospace">2,840 / 4,000 XP</text>
    </svg>
  );
}

function BridgeViz({ color }: { color: string }) {
  const L=[{n:"ETH",cy:16,c:"#627EEA"},{n:"BASE",cy:52,c:"#0052FF"}];
  const R=[{n:"ARB",cy:8,c:"#28A0F0"},{n:"POL",cy:32,c:"#8247E5"},{n:"BNB",cy:56,c:"#F0B90B"}];
  const hub={cx:80,cy:32};
  return (
    <svg width="100%" height="68" viewBox="0 0 200 68">
      {L.map(c=><line key={c.n} x1={28} y1={c.cy} x2={hub.cx-13} y2={hub.cy} stroke={c.c} strokeWidth="1" strokeDasharray="3 2" opacity="0.65"/>)}
      {R.map(c=><line key={c.n} x1={hub.cx+13} y1={hub.cy} x2={132} y2={c.cy} stroke={c.c} strokeWidth="1" strokeDasharray="3 2" opacity="0.65"/>)}
      <circle cx={hub.cx} cy={hub.cy} r="13" fill={`${color}22`} stroke={color} strokeWidth="1.5"
        style={{filter:`drop-shadow(0 0 7px ${color}66)`}}/>
      <text x={hub.cx} y={hub.cy+4} textAnchor="middle" fill={color} fontSize="6.5" fontFamily="monospace" fontWeight="700">BRIDGE</text>
      {L.map(c=><g key={c.n}>
        <circle cx={16} cy={c.cy} r="12" fill={`${c.c}20`} stroke={c.c} strokeWidth="1.5"/>
        <text x={16} y={c.cy+4} textAnchor="middle" fill={c.c} fontSize="7" fontFamily="monospace" fontWeight="700">{c.n}</text>
      </g>)}
      {R.map(c=><g key={c.n}>
        <circle cx={144} cy={c.cy} r="12" fill={`${c.c}20`} stroke={c.c} strokeWidth="1.5"/>
        <text x={144} y={c.cy+4} textAnchor="middle" fill={c.c} fontSize="7" fontFamily="monospace" fontWeight="700">{c.n}</text>
      </g>)}
      {([["5 CHAINS",20],["< 2 MIN",36],["NO WRAP",52]] as [string,number][]).map(([t,y])=>(
        <g key={t}>
          <rect x={163} y={y-8} width={34} height={12} fill={`${color}12`} stroke={`${color}28`} strokeWidth="1"/>
          <text x={180} y={y} textAnchor="middle" fill={`${color}99`} fontSize="6" fontFamily="monospace">{t}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Feature cards ─────────────────────────────────────────────────────────────

const FEATURES: Array<{
  to: string; icon: React.ElementType; label: string; color: string;
  desc: string; stat: string; graphic: (c: string) => React.ReactNode;
}> = [
  { to:"/swap",    icon:ArrowLeftRight, label:"SWAP",    color:"#7c5cfc", desc:"Multi-version DEX aggregator. Route trades through V2, V3 or V4 hooks for best execution.", stat:"V2 · V3 · V4",   graphic:c=><SwapFlow color={c}/> },
  { to:"/pool",    icon:Droplets,       label:"POOL",    color:"#38bdf8", desc:"Provide liquidity across Uniswap V2, concentrated V3 ranges, and hook-powered V4 pools.",    stat:"Up to 120% APR", graphic:c=><LiquidityBars color={c}/> },
  { to:"/perps",   icon:TrendingUp,     label:"PERPS",   color:"#f472b6", desc:"Trade perpetual futures with up to 100x leverage. Pyth & Chainlink oracle pricing.",         stat:"100x Leverage",  graphic:c=><CandleChart color={c}/> },
  { to:"/staking", icon:Coins,          label:"STAKING", color:"#a78bfa", desc:"Stake tokens in third-party reviewed pools. Fixed and variable APY with audited contracts.", stat:"High APY pools",  graphic:c=><StakingRing color={c}/> },
  { to:"/farm",    icon:Layers,         label:"FARM",    color:"#34d399", desc:"Deposit LP tokens to earn additional rewards on top of swap fees. Auto-compounding vaults.", stat:"LP Farming",      graphic:c=><FarmBars color={c}/> },
  { to:"/locker",  icon:Lock,           label:"LOCKER",  color:"#fb923c", desc:"Lock tokens or LP positions on-chain with a time-lock. Proof of commitment for your community.", stat:"Time-locked", graphic:c=><LockerViz color={c}/> },
  { to:"/quests",  icon:Trophy,         label:"QUESTS",  color:"#eab308", desc:"Complete on-chain and social tasks to earn XP and protocol rewards. Powered by SIWE auth.",  stat:"Earn XP",         graphic:c=><QuestBars color={c}/> },
  { to:"/bridge",  icon:ArrowRightLeft, label:"BRIDGE",  color:"#22d3ee", desc:"Cross-chain asset transfers between Ethereum, Base, Arbitrum, and more via trusted bridges.", stat:"Multi-chain",    graphic:c=><BridgeViz color={c}/> },
];

// ── Main landing page ─────────────────────────────────────────────────────────

export default function LandingPage() {
  const { data: pools } = useUniswapPools(1);

  const totalTvl = (pools ?? []).reduce((s, p) => s + p.tvlUSD, 0);
  const totalVol = (pools ?? []).reduce((s, p) => s + p.volume24h, 0);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem 2rem" }}>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", padding: "2rem 0 1.25rem", position: "relative" }}>
        {/* Glow orb */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -60%)",
          width: 600, height: 400,
          background: "radial-gradient(ellipse, rgba(124,92,252,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.3)",
          padding: "0.3rem 0.9rem", marginBottom: "0.9rem",
          fontSize: 10, letterSpacing: "0.2em", color: "var(--accent)",
          fontFamily: "'Share Tech Mono', monospace",
        }}>
          <span style={{ width: 6, height: 6, background: "var(--accent)", animation: "punkPulse 2s ease-in-out infinite" }} />
          PROTOCOL LIVE ON MAINNET & BASE
        </div>

        <h1 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.5rem)",
          lineHeight: 1.05, margin: "0 0 0.6rem",
          letterSpacing: "0.04em",
        }}>
          <span style={{ color: "var(--text)" }}>THE COMPLETE</span>
          <br />
          <span style={{
            color: "var(--accent)",
            textShadow: "0 0 40px var(--accent-glow)",
          }}>DEFI TERMINAL</span>
        </h1>

        <p style={{
          color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7,
          maxWidth: 560, margin: "0 auto 1.25rem",
          fontFamily: "'Share Tech Mono', monospace",
        }}>
          Swap · Pool · Farm · Stake · Lock · Bridge · Trade Perps · Complete Quests —
          all in one interface.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <Link to="/swap" style={{
            padding: "0.7rem 2rem",
            background: "var(--accent)", color: "var(--bg-deep)",
            fontWeight: 800, fontSize: 13, letterSpacing: "0.14em",
            fontFamily: "'Share Tech Mono', monospace",
            textDecoration: "none", border: "none",
            boxShadow: "0 0 20px var(--accent-glow)",
            display: "flex", alignItems: "center", gap: "0.4rem",
            transition: "all 0.12s",
          }}>
            LAUNCH APP  <ChevronRight size={14} />
          </Link>
          <Link to="/quests" style={{
            padding: "0.7rem 2rem",
            background: "transparent", color: "var(--text)",
            fontWeight: 700, fontSize: 13, letterSpacing: "0.14em",
            fontFamily: "'Share Tech Mono', monospace",
            textDecoration: "none", border: "1px solid var(--border)",
          }}>
            EARN QUESTS
          </Link>
        </div>

        {/* Live price tickers */}
        <PriceTicker />
      </div>

      {/* ── Protocol stats ────────────────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "1px", background: "var(--border)",
        border: "1px solid var(--border)",
        marginBottom: "2rem",
        overflow: "hidden",
      }}>
        {[
          { value: Math.round(totalTvl / 1_000_000) || 28, label: "TVL (USD)",     prefix: "$", suffix: "M" },
          { value: Math.round(totalVol / 1_000_000) || 142, label: "24H VOLUME",   prefix: "$", suffix: "M" },
          { value: 8,                                        label: "FEATURES",    suffix: ""  },
          { value: 4,                                        label: "CHAINS",      suffix: ""  },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--bg-card)", padding: "1.1rem 1rem" }}>
            <AnimatedStat {...s} />
          </div>
        ))}
      </div>

      {/* ── TVL Chart + Pool Stats ─────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", marginBottom: "2rem", alignItems: "start" }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderTop: "2px solid var(--accent)", padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Activity size={13} color="var(--accent)" />
            <span style={{ fontSize: 10, letterSpacing: "0.18em", fontFamily: "'Share Tech Mono', monospace", color: "var(--text-muted)" }}>PROTOCOL TVL — 60 DAY</span>
          </div>
          <TvlChart />
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderTop: "2px solid #38bdf8", padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <BarChart2 size={13} color="#38bdf8" />
            <span style={{ fontSize: 10, letterSpacing: "0.18em", fontFamily: "'Share Tech Mono', monospace", color: "var(--text-muted)" }}>TOP POOLS BY TVL</span>
          </div>
          <PoolStatsBar />
        </div>
      </div>

      {/* ── Features Grid ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <div style={{ width: 2, height: 18, background: "var(--accent)", boxShadow: "0 0 8px var(--accent-glow)" }} />
        <h2 style={{
          fontFamily: "'Rajdhani', sans-serif", fontWeight: 900,
          fontSize: 18, margin: 0, letterSpacing: "0.1em", color: "var(--text)",
        }}>PROTOCOL FEATURES</h2>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "1px", background: "var(--border)",
        border: "1px solid var(--border)",
        marginBottom: "2rem",
        overflow: "hidden",
      }}>
        {FEATURES.map(f => (
          <Link key={f.to + f.label} to={f.to} style={{ textDecoration: "none", display: "block" }}>
            <div
              style={{ background: "var(--bg-card)", padding: "1rem", height: "100%", boxSizing: "border-box", transition: "background 0.12s", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card2)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card)";
              }}
            >
              {/* Top accent */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: f.color, opacity: 0.7 }} />

              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div style={{
                  width: 36, height: 36,
                  background: `${f.color}18`,
                  border: `1px solid ${f.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <f.icon size={16} color={f.color} />
                </div>
                <span style={{
                  fontSize: 9, letterSpacing: "0.15em",
                  color: f.color, fontFamily: "'Share Tech Mono', monospace",
                  border: `1px solid ${f.color}40`,
                  padding: "2px 6px",
                  background: `${f.color}10`,
                }}>
                  {f.stat}
                </span>
              </div>

              <div style={{
                fontFamily: "'Rajdhani', sans-serif", fontWeight: 800,
                fontSize: 15, color: "var(--text)", letterSpacing: "0.08em",
                marginBottom: "0.35rem",
              }}>
                {f.label}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.55, marginBottom: "0.85rem" }}>
                {f.desc}
              </div>

              {/* Feature graphic */}
              <div style={{ marginTop: "0.5rem" }}>{f.graphic(f.color)}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Why JinkFi ────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <div style={{ width: 2, height: 18, background: "var(--accent)", boxShadow: "0 0 8px var(--accent-glow)" }} />
        <h2 style={{
          fontFamily: "'Rajdhani', sans-serif", fontWeight: 900,
          fontSize: 18, margin: 0, letterSpacing: "0.1em", color: "var(--text)",
        }}>WHY JINKFI</h2>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "1rem", marginBottom: "2rem",
      }}>
        {[
          { icon: Shield, color: "#34d399", title: "Non-Custodial",  body: "Your keys, your tokens. All transactions are signed locally. We never hold funds." },
          { icon: Zap,    color: "var(--accent)", title: "Gas Optimised", body: "Smart routing minimises hops. V4 singleton pool architecture cuts gas up to 70%." },
          { icon: Users,  color: "#a78bfa", title: "Community Owned", body: "Protocol submissions are open to any project. Governance is on-chain and transparent." },
          { icon: Activity, color: "#f472b6", title: "Live Oracle Data", body: "Chainlink and Pyth feeds power perps pricing and on-chain quest verification." },
        ].map(item => (
          <div key={item.title} style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderLeft: `3px solid ${item.color}`,
            padding: "0.85rem 1rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <item.icon size={14} color={item.color} />
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 800, fontSize: 14, color: "var(--text)", letterSpacing: "0.06em" }}>
                {item.title}
              </span>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>{item.body}</p>
          </div>
        ))}
      </div>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderTop: "2px solid var(--accent)",
        padding: "1.5rem", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.06), transparent 70%)",
          pointerEvents: "none",
        }} />
        <h2 style={{
          fontFamily: "'Rajdhani', sans-serif", fontWeight: 900,
          fontSize: "clamp(1.5rem, 4vw, 2.5rem)", margin: "0 0 0.5rem",
          letterSpacing: "0.06em", color: "var(--text)",
        }}>
          READY TO TRADE?
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "0 0 1.75rem", fontFamily: "'Share Tech Mono', monospace" }}>
          Connect your wallet and start exploring the protocol.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/swap" style={{
            padding: "0.7rem 2rem",
            background: "var(--accent)", color: "var(--bg-deep)",
            fontWeight: 800, fontSize: 13, letterSpacing: "0.14em",
            fontFamily: "'Share Tech Mono', monospace",
            textDecoration: "none",
            boxShadow: "0 0 24px var(--accent-glow)",
            display: "flex", alignItems: "center", gap: "0.4rem",
          }}>
            START SWAPPING <ChevronRight size={14} />
          </Link>
          <Link to="/perps" style={{
            padding: "0.7rem 2rem",
            background: "transparent", color: "#f472b6",
            fontWeight: 700, fontSize: 13, letterSpacing: "0.14em",
            fontFamily: "'Share Tech Mono', monospace",
            textDecoration: "none", border: "1px solid rgba(244,114,182,0.4)",
            display: "flex", alignItems: "center", gap: "0.4rem",
          }}>
            TRADE PERPS <TrendingUp size={13} />
          </Link>
          <Link to="/staking/create" style={{
            padding: "0.7rem 2rem",
            background: "transparent", color: "var(--text-muted)",
            fontWeight: 700, fontSize: 13, letterSpacing: "0.14em",
            fontFamily: "'Share Tech Mono', monospace",
            textDecoration: "none", border: "1px solid var(--border)",
          }}>
            LIST YOUR PROJECT
          </Link>
        </div>
      </div>
    </div>
  );
}
