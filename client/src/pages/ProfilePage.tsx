import { useState, useEffect } from "react";
import { useAccount, useBalance, useChainId, useEnsName, useReadContracts } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import {
  Copy, Check, ExternalLink, TrendingUp,
  Wallet, Activity, ArrowUpRight, ArrowDownLeft, RefreshCw,
} from "lucide-react";
import { formatUnits } from "viem";
import { usePerps } from "../hooks/usePerps";
import { DEFAULT_TOKENS, ETH_ADDRESS } from "../lib/tokens";
import { ERC20_ABI } from "../lib/contracts";

// ── helpers ─────────────────────────────────────────────────────────────────

function trunc(addr: string, n = 6) {
  return `${addr.slice(0, n)}...${addr.slice(-4)}`;
}
function fmtUSD(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

// Deterministic color avatar from address
function avatarGradient(addr?: string) {
  if (!addr) return "linear-gradient(135deg, #00303f, #d4af37)";
  const h1 = parseInt(addr.slice(2, 8), 16) % 360;
  const h2 = (h1 + 140) % 360;
  return `linear-gradient(135deg, hsl(${h1},60%,28%), hsl(${h2},65%,35%))`;
}

const CHAIN_META: Record<number, { name: string; color: string }> = {
  1: { name: "Ethereum", color: "#627EEA" }, 8453: { name: "Base", color: "#0052FF" },
  42161: { name: "Arbitrum", color: "#28A0F0" }, 137: { name: "Polygon", color: "#8247E5" },
  10: { name: "Optimism", color: "#FF0420" }, 56: { name: "BNB Chain", color: "#F0B90B" },
  999: { name: "HyperEVM", color: "#d4af37" }, 6342: { name: "MegaETH", color: "#FF6B35" },
  10143: { name: "Monad", color: "#836EF9" }, 361: { name: "Plasma", color: "#7C3AED" },
  4217: { name: "Tempo", color: "#0EA5E9" }, 11155111: { name: "Sepolia", color: "#627EEA" },
};


// ── Known method IDs → human label ───────────────────────────────────────────
const METHOD_LABELS: Record<string, { label: string; icon: "swap" | "add" | "remove" | "out" | "in" }> = {
  "0x38ed1739": { label: "Swap",            icon: "swap" },
  "0x7ff36ab5": { label: "Swap ETH → Token",icon: "swap" },
  "0x18cbafe5": { label: "Swap Token → ETH",icon: "swap" },
  "0xe8e33700": { label: "Add Liquidity",   icon: "add"  },
  "0xf305d719": { label: "Add Liquidity ETH",icon:"add"  },
  "0xbaa2abde": { label: "Remove Liquidity",icon: "remove"},
  "0x02751cec": { label: "Remove Liquidity ETH",icon:"remove"},
  "0x88316456": { label: "V3 Mint Position",icon: "add"  },
  "0xa9059cbb": { label: "Transfer",        icon: "out"  },
  "0x23b872dd": { label: "Transfer From",   icon: "out"  },
};

type TxRecord = {
  hash: string;
  timestamp: number;
  to: string;
  value: string;
  isError: boolean;
  methodId: string;
};

const EXPLORER_API: Record<number, string> = {
  1:        "https://api.etherscan.io/api",
  11155111: "https://api-sepolia.etherscan.io/api",
  8453:     "https://api.basescan.org/api",
  42161:    "https://api.arbiscan.io/api",
  137:      "https://api.polygonscan.com/api",
  10:       "https://api-optimistic.etherscan.io/api",
};

// ── CoinGecko price fetch ─────────────────────────────────────────────────────
const COINGECKO_IDS: Record<string, string> = {
  ETH:  "ethereum",
  WETH: "weth",
  USDC: "usd-coin",
  USDT: "tether",
  WBTC: "wrapped-bitcoin",
  DAI:  "dai",
  UNI:  "uniswap",
  LINK: "chainlink",
  AAVE: "aave",
  MATIC:"matic-network",
};

function usePrices(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const ids = [...new Set(symbols.map((s) => COINGECKO_IDS[s]).filter(Boolean))];
    if (ids.length === 0) return;
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`)
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, number> = {};
        for (const [sym, id] of Object.entries(COINGECKO_IDS)) {
          if (data[id]?.usd) map[sym] = data[id].usd;
        }
        setPrices(map);
      })
      .catch(() => {});
  }, [symbols.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return prices;
}

function useActivity(address?: string, chainId?: number) {
  const [txs, setTxs] = useState<TxRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address || !chainId) return;
    const api = EXPLORER_API[chainId];
    if (!api) return;

    setLoading(true);
    fetch(`${api}?module=account&action=txlist&address=${address}&page=1&offset=25&sort=desc`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "1" && Array.isArray(data.result)) {
          setTxs(
            data.result.map((tx: Record<string, string>) => ({
              hash: tx.hash,
              timestamp: Number(tx.timeStamp) * 1000,
              to: tx.to,
              value: tx.value,
              isError: tx.isError === "1",
              methodId: (tx.input ?? "").slice(0, 10) || "0x",
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [address, chainId]);

  return { txs, loading };
}

const TABS = ["Portfolio", "Positions", "Activity"] as const;
type Tab = typeof TABS[number];

// ── Sparkline SVG ────────────────────────────────────────────────────────────

function Sparkline({ data, color = "var(--accent)", height = 48 }: { data: number[]; color?: string; height?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 200, h = height;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height, display: "block" }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="spkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
      <path d={`M0,${h} L${pts} L${w},${h} Z`} fill="url(#spkGrad)" />
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });
  const { data: ensName } = useEnsName({ address, chainId: 1 });
  const { login } = usePrivy();
  const perps = usePerps();
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<Tab>("Portfolio");

  const chain = CHAIN_META[chainId];
  const ethBal = balance ? Number(balance.value) / 10 ** balance.decimals : 0;

  // ERC-20 balances
  const erc20Tokens = DEFAULT_TOKENS.filter((t) => t.address !== ETH_ADDRESS);
  const { data: erc20Results } = useReadContracts({
    contracts: erc20Tokens.map((t) => ({
      address: t.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "balanceOf" as const,
      args: [address!] as [`0x${string}`],
    })),
    query: { enabled: !!address },
  });
  const erc20Holdings = erc20Tokens
    .map((t, i) => ({
      token: t,
      balance: erc20Results?.[i]?.status === "success"
        ? Number(formatUnits(erc20Results[i].result as bigint, t.decimals))
        : 0,
    }))
    .filter((h) => h.balance > 0);

  // Live prices
  const allSymbols = ["ETH", ...erc20Holdings.map((h) => h.token.symbol)];
  const prices = usePrices(allSymbols);
  const liveEthPrice = prices["ETH"] ?? 3542.80;
  const liveEthValue = ethBal * liveEthPrice;
  const erc20Value = erc20Holdings.reduce(
    (sum, { token, balance: bal }) => sum + bal * (prices[token.symbol] ?? 0),
    0
  );
  const holdingsValue = liveEthValue + erc20Value;

  // Activity
  const { txs, loading: activityLoading } = useActivity(address, chainId);

  // Sparkline — simulated 30-day portfolio curve
  const sparkData = [82, 79, 85, 91, 88, 94, 90, 87, 92, 98, 95, 102, 99, 108, 104, 110, 107, 115, 112, 118, 114, 122, 119, 125, 121, 128, 124, 131, 127, 134];

  const copyAddr = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // ── Not connected ──────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div style={{ maxWidth: 520, margin: "4rem auto", padding: "1.5rem", textAlign: "center" }}>
        <div style={{
          width: 72, height: 72, margin: "0 auto 1.25rem",
          background: "var(--bg-card)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Wallet size={28} color="var(--text-muted)" />
        </div>
        <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: "0.1em", fontFamily: "'Rajdhani', sans-serif", marginBottom: "0.5rem" }}>NO WALLET CONNECTED</div>
        <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'Share Tech Mono', monospace", marginBottom: "1.5rem" }}>Connect your wallet to view your profile and portfolio</div>
        <button
          onClick={() => login()}
          style={{
            padding: "0.75rem 2rem", border: "1px solid var(--accent)",
            background: "var(--accent)", color: "var(--bg-deep)",
            fontWeight: 900, fontSize: 13, letterSpacing: "0.1em",
            cursor: "pointer", fontFamily: "'Rajdhani', sans-serif",
            boxShadow: "0 0 24px var(--accent-glow)",
          }}
        >
          CONNECT WALLET
        </button>
      </div>
    );
  }

  // ── Connected ──────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem" }}>

      {/* ── Profile header ──────────────────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "auto 1fr", gap: "1.5rem",
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderTop: "1px solid var(--border-bright)",
        padding: "1.5rem", marginBottom: "1rem",
        position: "relative",
        clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)",
        animation: "fadeIn 0.3s ease",
      }}>
        {/* Cut corner */}
        <div style={{ position: "absolute", top: 0, right: 0, width: 20, height: 20, borderTop: "1px solid var(--accent)", borderRight: "1px solid var(--accent)", boxShadow: "2px -2px 8px var(--accent-glow)" }} />

        {/* Avatar */}
        <div style={{
          width: 80, height: 80, flexShrink: 0,
          background: avatarGradient(address),
          border: "2px solid var(--border-bright)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 24px var(--accent-glow)",
          position: "relative",
        }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: "#fff", fontFamily: "'Rajdhani', sans-serif", opacity: 0.9 }}>
            {address ? address.slice(2, 4).toUpperCase() : "??"}
          </span>
          {/* Online dot */}
          <div style={{ position: "absolute", bottom: 4, right: 4, width: 10, height: 10, background: "var(--accent)", boxShadow: "0 0 8px var(--accent-glow)", animation: "punkPulse 2s ease-in-out infinite" }} />
        </div>

        {/* Info */}
        <div>
          {/* Name / ENS */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
            <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "0.06em", fontFamily: "'Rajdhani', sans-serif" }}>
              {ensName ?? trunc(address!, 8)}
            </div>
            {chain && (
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: chain.color, border: `1px solid ${chain.color}55`, padding: "2px 7px", fontFamily: "'Share Tech Mono', monospace" }}>
                {chain.name.toUpperCase()}
              </span>
            )}
            {connector && (
              <span style={{ fontSize: 9, color: "var(--text-muted)", border: "1px solid var(--border)", padding: "2px 7px", fontFamily: "'Share Tech Mono', monospace" }}>
                {connector.name.toUpperCase()}
              </span>
            )}
          </div>

          {/* Address row */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
              {address}
            </span>
            <button onClick={copyAddr} style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "var(--accent)" : "var(--text-muted)", padding: 0, transition: "color 0.15s" }}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
            <a href={`https://etherscan.io/address/${address}`} target="_blank" rel="noreferrer" style={{ color: "var(--text-muted)", display: "flex" }}>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Quick stats */}
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            {[
              { label: "PORTFOLIO",  value: fmtUSD(holdingsValue), color: "var(--text)" },
              { label: "POSITIONS",  value: String(perps.positions.length), color: "var(--text)" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 9, letterSpacing: "0.16em", color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", marginBottom: "0.15rem" }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.color, fontFamily: "'Share Tech Mono', monospace" }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      {/* Removed: stat cards with hardcoded values. Will re-add when live data API available. */}

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", overflow: "hidden" }}>
        {/* Tab bar */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "0.65rem 1.25rem",
                background: "transparent", border: "none",
                borderBottom: `2px solid ${tab === t ? "var(--accent)" : "transparent"}`,
                color: tab === t ? "var(--accent)" : "var(--text-muted)",
                cursor: "pointer", fontWeight: 700, fontSize: 11,
                letterSpacing: "0.12em", fontFamily: "'Share Tech Mono', monospace",
                transition: "all 0.15s",
              }}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ── PORTFOLIO tab ────────────────────────────────────────────── */}
        {tab === "Portfolio" && (
          <div>
            {/* ETH balance row */}
            <HoldingRow symbol="ETH" name="Ether" amount={ethBal} price={liveEthPrice} isLive />

            {/* ERC-20 balances */}
            {erc20Holdings.map(({ token, balance: bal }) => (
              <HoldingRow
                key={token.address}
                symbol={token.symbol}
                name={token.name}
                amount={bal}
                price={prices[token.symbol] ?? 0}
              />
            ))}

            {/* Total */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "0.85rem 1.25rem",
              borderTop: "1px solid var(--border)",
              background: "rgba(0,0,0,0.2)",
            }}>
              <span style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>TOTAL VALUE</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: "var(--text)", fontFamily: "'Share Tech Mono', monospace" }}>{fmtUSD(holdingsValue)}</span>
            </div>
          </div>
        )}

        {/* ── POSITIONS tab ────────────────────────────────────────────── */}
        {tab === "Positions" && (
          <div>
            {perps.positions.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center" }}>
                <TrendingUp size={32} color="var(--text-muted)" style={{ margin: "0 auto 0.75rem", display: "block", opacity: 0.4 }} />
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.1em" }}>NO OPEN POSITIONS</div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 100px 100px 100px 80px 80px",
                  padding: "0.5rem 1.25rem",
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
                  color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace",
                  borderBottom: "1px solid var(--border)",
                }}>
                  <span>MARKET</span><span style={{ textAlign: "right" }}>SIZE</span>
                  <span style={{ textAlign: "right" }}>ENTRY</span><span style={{ textAlign: "right" }}>MARK</span>
                  <span style={{ textAlign: "right" }}>PNL</span><span style={{ textAlign: "right" }}>ACTION</span>
                </div>
                {perps.positions.map((p, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "1fr 100px 100px 100px 80px 80px",
                    padding: "0.85rem 1.25rem", alignItems: "center",
                    borderBottom: i < perps.positions.length - 1 ? "1px solid var(--border)" : "none",
                    background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.1)",
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{p.market}</div>
                      <div style={{ fontSize: 9, color: p.side === "long" ? "#4ade80" : "var(--accent)", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.08em" }}>
                        {p.side.toUpperCase()} {p.leverage}x
                      </div>
                    </div>
                    <div style={{ textAlign: "right", fontSize: 12, fontFamily: "'Share Tech Mono', monospace" }}>{fmtUSD(p.sizeUSD)}</div>
                    <div style={{ textAlign: "right", fontSize: 12, fontFamily: "'Share Tech Mono', monospace" }}>${p.entryPrice.toFixed(2)}</div>
                    <div style={{ textAlign: "right", fontSize: 12, fontFamily: "'Share Tech Mono', monospace" }}>${p.markPrice.toFixed(2)}</div>
                    <div style={{ textAlign: "right", fontSize: 12, fontWeight: 700, color: p.unrealizedPnl >= 0 ? "#4ade80" : "var(--accent)", fontFamily: "'Share Tech Mono', monospace" }}>
                      {p.unrealizedPnl >= 0 ? "+" : ""}{fmtUSD(p.unrealizedPnl)}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <button
                        onClick={() => perps.closePosition(p.id)}
                        style={{ fontSize: 9, padding: "3px 8px", border: "1px solid var(--accent)", background: "transparent", color: "var(--accent)", cursor: "pointer", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.06em" }}
                      >
                        CLOSE
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── ACTIVITY tab ─────────────────────────────────────────────── */}
        {tab === "Activity" && (
          <div>
            {activityLoading && (
              <div style={{ padding: "2rem", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
                LOADING ACTIVITY...
              </div>
            )}
            {!activityLoading && txs.length === 0 && (
              <div style={{ padding: "3rem", textAlign: "center" }}>
                <Activity size={32} color="var(--text-muted)" style={{ margin: "0 auto 0.75rem", display: "block", opacity: 0.4 }} />
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.1em" }}>
                  {EXPLORER_API[chainId] ? "NO TRANSACTIONS FOUND" : "EXPLORER NOT SUPPORTED FOR THIS NETWORK"}
                </div>
              </div>
            )}
            {txs.map((tx, i) => {
              const method = METHOD_LABELS[tx.methodId];
              const ethVal = Number(tx.value) / 1e18;
              const date = new Date(tx.timestamp);
              const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
              return (
                <div key={tx.hash} style={{
                  display: "grid", gridTemplateColumns: "24px 1fr auto auto",
                  gap: "0.75rem", alignItems: "center",
                  padding: "0.85rem 1.25rem",
                  borderBottom: i < txs.length - 1 ? "1px solid var(--border)" : "none",
                  background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.1)",
                  opacity: tx.isError ? 0.5 : 1,
                }}>
                  {/* Icon */}
                  <div style={{ color: tx.isError ? "var(--accent)" : method?.icon === "swap" ? "#60a5fa" : method?.icon === "add" ? "#4ade80" : method?.icon === "remove" ? "#fb923c" : "var(--text-muted)" }}>
                    {method?.icon === "swap" ? <RefreshCw size={14} /> : method?.icon === "out" || method?.icon === "remove" ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                  </div>

                  {/* Label + hash */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: tx.isError ? "var(--accent)" : "var(--text)" }}>
                      {tx.isError ? "Failed — " : ""}{method?.label ?? (tx.methodId === "0x" ? "ETH Transfer" : tx.methodId)}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
                      {tx.hash.slice(0, 10)}…{tx.hash.slice(-6)}
                    </div>
                  </div>

                  {/* ETH value */}
                  <div style={{ textAlign: "right", fontSize: 12, fontFamily: "'Share Tech Mono', monospace", color: "var(--text)" }}>
                    {ethVal > 0 ? `${ethVal < 0.001 ? ethVal.toExponential(2) : ethVal.toFixed(4)} ETH` : ""}
                  </div>

                  {/* Date + link */}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>{dateStr}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>{timeStr}</div>
                    <a href={`${chainId === 11155111 ? "https://sepolia.etherscan.io" : "https://etherscan.io"}/tx/${tx.hash}`}
                      target="_blank" rel="noreferrer"
                      style={{ color: "var(--accent)", display: "inline-flex", marginTop: 2 }}>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Holding row ──────────────────────────────────────────────────────────────

function HoldingRow({ symbol, name, amount, price, isLive }: {
  symbol: string; name: string; amount: number; price: number; isLive?: boolean;
}) {
  const value = amount * price;
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 130px 110px",
      padding: "0.85rem 1.25rem", alignItems: "center",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
        <div style={{
          width: 32, height: 32, background: "var(--bg-input)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 800, color: "var(--accent)",
          fontFamily: "'Share Tech Mono', monospace", flexShrink: 0,
        }}>{symbol.slice(0, 3)}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: "0.4rem" }}>
            {symbol}
            {isLive && <span style={{ fontSize: 8, color: "var(--accent)", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.08em" }}>LIVE</span>}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{name}</div>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 12, fontFamily: "'Share Tech Mono', monospace" }}>{amount < 0.01 ? amount.toFixed(6) : amount.toFixed(4)}</div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>${price.toLocaleString()}</div>
      </div>
      <div style={{ textAlign: "right", fontWeight: 700, fontSize: 14, fontFamily: "'Share Tech Mono', monospace" }}>{fmtUSD(value)}</div>
    </div>
  );
}
