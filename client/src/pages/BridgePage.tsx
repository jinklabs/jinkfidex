import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowDownUp, ChevronDown, Info, Zap, Loader } from "lucide-react";
import { useAccount, useWalletClient } from "wagmi";
import { createConfig, getRoutes, executeRoute, EVM } from "@lifi/sdk";
import type { Route } from "@lifi/sdk";
import { parseUnits } from "viem";

// ── Li.Fi SDK init ────────────────────────────────────────────────────────────
createConfig({
  integrator: "jinkfi",
  apiKey: import.meta.env.VITE_LIFI_API_KEY,
});

// ── Chains supported by Li.Fi ────────────────────────────────────────────────
const CHAINS = [
  { id: 1,      name: "Ethereum",  short: "ETH",  color: "#627EEA", symbol: "ETH"  },
  { id: 8453,   name: "Base",      short: "BASE", color: "#0052FF", symbol: "ETH"  },
  { id: 42161,  name: "Arbitrum",  short: "ARB",  color: "#28A0F0", symbol: "ETH"  },
  { id: 137,    name: "Polygon",   short: "POL",  color: "#8247E5", symbol: "POL"  },
  { id: 10,     name: "Optimism",  short: "OP",   color: "#FF0420", symbol: "ETH"  },
  { id: 56,     name: "BNB Chain", short: "BNB",  color: "#F0B90B", symbol: "BNB"  },
  { id: 100,    name: "Gnosis",    short: "GNO",  color: "#04795B", symbol: "xDAI" },
  { id: 43114,  name: "Avalanche", short: "AVAX", color: "#E84142", symbol: "AVAX" },
];

// ── Token config ──────────────────────────────────────────────────────────────
type TokenSymbol = "ETH" | "USDC" | "USDT" | "WBTC" | "DAI" | "LINK" | "UNI";

const NATIVE = "0x0000000000000000000000000000000000000000";

const TOKEN_DECIMALS: Record<TokenSymbol, number> = {
  ETH: 18, USDC: 6, USDT: 6, WBTC: 8, DAI: 18, LINK: 18, UNI: 18,
};

const TOKEN_ADDRESSES: Record<number, Partial<Record<TokenSymbol, string>>> = {
  1: {
    ETH:  NATIVE,
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    DAI:  "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    LINK: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    UNI:  "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  },
  8453: {
    ETH:  NATIVE,
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    DAI:  "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    LINK: "0xd403D1624E32dc29B8C57E25Ec2410e6DdE7c41f",
    UNI:  "0xc3De830EA07524a0761646a6a4e4be0e114a3C83",
  },
  42161: {
    ETH:  NATIVE,
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    WBTC: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    DAI:  "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    LINK: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
    UNI:  "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
  },
  137: {
    ETH:  NATIVE,
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    WBTC: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
    DAI:  "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    LINK: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39",
    UNI:  "0xb33EaAd8d922B1083446DC23f610c2567fB5180f",
  },
  10: {
    ETH:  NATIVE,
    USDC: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    USDT: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    WBTC: "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
    DAI:  "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    LINK: "0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6",
    UNI:  "0x6fd9d7AD17242c41f7131d257212c54A0e816691",
  },
  56: {
    ETH:  NATIVE,
    USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    USDT: "0x55d398326f99059fF775485246999027B3197955",
    WBTC: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    DAI:  "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    LINK: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    UNI:  "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
  },
  100: {
    ETH:  NATIVE,
    USDC: "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83",
    USDT: "0x4ECaBa5870353805a9F068101A40E0f32ed605C6",
    DAI:  "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d",
    LINK: "0xE2e73A1c69ecF83F464EFCE6A5be353a37cA09b2",
  },
  43114: {
    ETH:  NATIVE,
    USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    USDT: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
    WBTC: "0x50b7545627a5162F82A992c33b87aDc75187B218",
    DAI:  "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
    LINK: "0x5947BB275c521040051D82396192181b413227A3",
    UNI:  "0x8eBAf22B6F053dFFeaf46f4Dd9eFA95D89ba8580",
  },
};

const TOKENS: TokenSymbol[] = ["ETH", "USDC", "USDT", "WBTC", "DAI", "LINK", "UNI"];

type Chain = typeof CHAINS[number];

// ── Sub-components ────────────────────────────────────────────────────────────

function ChainDropdown({ value, onChange, exclude }: { value: Chain; onChange: (c: Chain) => void; exclude?: Chain }) {
  const [open, setOpen] = useState(false);
  const available = CHAINS.filter(c => c.id !== exclude?.id);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          padding: "0.55rem 0.8rem",
          background: "var(--bg-input)",
          border: `1px solid ${open ? value.color : "var(--border)"}`,
          color: "var(--text)", cursor: "pointer", width: "100%",
          boxShadow: open ? `0 0 12px ${value.color}44` : "none",
          transition: "all 0.12s",
        }}
      >
        <div style={{ width: 8, height: 8, background: value.color, boxShadow: `0 0 6px ${value.color}`, flexShrink: 0 }} />
        <span style={{ flex: 1, textAlign: "left", fontSize: 13, fontWeight: 700 }}>{value.name}</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>{value.short}</span>
        <ChevronDown size={12} style={{ opacity: 0.5, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 100,
          background: "rgba(4,8,18,0.99)",
          border: "1px solid var(--border)",
          borderTop: `1px solid var(--accent)`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
          animation: "fadeIn 0.12s ease",
          maxHeight: 280, overflowY: "auto",
        }}>
          {available.map(c => (
            <button
              key={c.id}
              onClick={() => { onChange(c); setOpen(false); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "0.6rem",
                padding: "0.55rem 0.75rem",
                background: value.id === c.id ? `${c.color}12` : "transparent",
                border: "none",
                borderLeft: `3px solid ${value.id === c.id ? c.color : "transparent"}`,
                color: value.id === c.id ? c.color : "var(--text-muted)",
                cursor: "pointer", textAlign: "left",
                fontSize: 12, fontWeight: value.id === c.id ? 700 : 500,
                transition: "all 0.1s",
              }}
              onMouseEnter={e => { if (value.id !== c.id) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "var(--text)"; } }}
              onMouseLeave={e => { if (value.id !== c.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; } }}
            >
              <div style={{ width: 7, height: 7, background: c.color, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{c.name}</span>
              <span style={{ fontSize: 9, fontFamily: "'Share Tech Mono', monospace" }}>{c.short}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TokenDropdown({ value, onChange }: { value: TokenSymbol; onChange: (t: TokenSymbol) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: "0.4rem",
          padding: "0.35rem 0.65rem",
          background: "rgba(202,228,219,0.08)",
          border: "1px solid var(--border-bright)",
          color: "var(--accent)", cursor: "pointer",
          fontSize: 12, fontWeight: 800, letterSpacing: "0.04em",
          fontFamily: "'Share Tech Mono', monospace",
          transition: "all 0.12s",
        }}
      >
        {value}
        <ChevronDown size={10} style={{ opacity: 0.6, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 100,
          background: "rgba(4,8,18,0.99)",
          border: "1px solid var(--border)",
          borderTop: "1px solid var(--accent)",
          minWidth: 100,
          animation: "fadeIn 0.12s ease",
          boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
        }}>
          {TOKENS.map(t => (
            <button
              key={t}
              onClick={() => { onChange(t); setOpen(false); }}
              style={{
                width: "100%", padding: "0.45rem 0.75rem",
                background: value === t ? "rgba(202,228,219,0.08)" : "transparent",
                border: "none",
                borderLeft: `3px solid ${value === t ? "var(--accent)" : "transparent"}`,
                color: value === t ? "var(--accent)" : "var(--text-muted)",
                cursor: "pointer", textAlign: "left",
                fontSize: 12, fontWeight: value === t ? 700 : 500,
                fontFamily: "'Share Tech Mono', monospace",
                transition: "all 0.1s",
              }}
              onMouseEnter={e => { if (value !== t) { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; } }}
              onMouseLeave={e => { if (value !== t) { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; } }}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTokenAmount(amountRaw: string, decimals: number, displayDecimals = 6): string {
  const n = Number(BigInt(amountRaw)) / Math.pow(10, decimals);
  return n.toFixed(displayDecimals);
}

function formatUSD(usd: string | number | undefined): string {
  if (usd === undefined || usd === null) return "";
  const n = typeof usd === "string" ? parseFloat(usd) : usd;
  if (isNaN(n)) return "";
  return `$${n.toFixed(2)}`;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `~${seconds}s`;
  return `~${Math.round(seconds / 60)}m`;
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BridgePage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [fromChain, setFromChain] = useState(CHAINS[0]);
  const [toChain,   setToChain]   = useState(CHAINS[2]);
  const [token,     setToken]     = useState<TokenSymbol>("ETH");
  const [amount,    setAmount]    = useState("");

  const [routes,    setRoutes]    = useState<Route[]>([]);
  const [bestRoute, setBestRoute] = useState<Route | null>(null);
  const [fetching,  setFetching]  = useState(false);
  const [routeErr,  setRouteErr]  = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [txHash,    setTxHash]    = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch routes (debounced) ────────────────────────────────────────────────
  const fetchRoutes = useCallback(async (
    fromC: Chain, toC: Chain, tok: TokenSymbol, amt: string, fromAddr: string,
  ) => {
    const fromTokenAddr = TOKEN_ADDRESSES[fromC.id]?.[tok];
    const toTokenAddr   = TOKEN_ADDRESSES[toC.id]?.[tok] ?? TOKEN_ADDRESSES[toC.id]?.["USDC"];
    if (!fromTokenAddr || !toTokenAddr) { setRouteErr("Token not available on this chain."); return; }

    const decimals = TOKEN_DECIMALS[tok];
    let fromAmountWei: string;
    try {
      fromAmountWei = parseUnits(amt, decimals).toString();
    } catch {
      setRouteErr("Invalid amount."); return;
    }

    setFetching(true);
    setRouteErr(null);
    setRoutes([]);
    setBestRoute(null);

    try {
      const result = await getRoutes({
        fromChainId:      fromC.id,
        toChainId:        toC.id,
        fromTokenAddress: fromTokenAddr,
        toTokenAddress:   toTokenAddr,
        fromAmount:       fromAmountWei,
        fromAddress:      fromAddr,
        options: { slippage: 0.005, order: "RECOMMENDED" },
      });
      if (result.routes.length === 0) {
        setRouteErr("No routes found for this pair.");
      } else {
        setRoutes(result.routes);
        setBestRoute(result.routes[0]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch routes.";
      setRouteErr(msg);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setRoutes([]); setBestRoute(null); setRouteErr(null); return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchRoutes(fromChain, toChain, token, amount, address ?? "0x0000000000000000000000000000000000000001");
    }, 700);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fromChain, toChain, token, amount, address, fetchRoutes]);

  // ── Execute bridge ──────────────────────────────────────────────────────────
  const handleBridge = async () => {
    if (!bestRoute || !walletClient) return;
    setExecuting(true);
    setTxHash(null);
    try {
      // Reconfigure with live wallet client before execution
      createConfig({
        integrator: "jinkfi",
        apiKey: import.meta.env.VITE_LIFI_API_KEY,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        providers: [EVM({ getWalletClient: async () => walletClient as any })],
      });
      const result = await executeRoute(bestRoute, {
        updateRouteHook(updatedRoute) {
          setBestRoute({ ...updatedRoute });
          const stepWithTx = updatedRoute.steps.find(s => s.execution?.process?.find(p => p.txHash));
          if (stepWithTx) {
            const proc = stepWithTx.execution?.process?.find(p => p.txHash);
            if (proc?.txHash) setTxHash(proc.txHash);
          }
        },
      });
      setBestRoute(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bridge execution failed.";
      setRouteErr(msg);
    } finally {
      setExecuting(false);
    }
  };

  const flip = () => {
    setFromChain(toChain);
    setToChain(fromChain);
    setRoutes([]); setBestRoute(null); setRouteErr(null);
  };

  // ── Derived display values ──────────────────────────────────────────────────
  const destToken = bestRoute?.toToken;
  const receiveEst = bestRoute
    ? formatTokenAmount(bestRoute.toAmountMin, bestRoute.toToken.decimals)
    : "";
  const receiveEstExact = bestRoute
    ? formatTokenAmount(bestRoute.toAmount, bestRoute.toToken.decimals)
    : "";

  const gasCostUSD  = bestRoute?.gasCostUSD;
  const feeCostUSD  = bestRoute?.steps[0]?.estimate?.feeCosts?.[0]?.amountUSD;
  const estTime     = bestRoute ? formatTime(
    bestRoute.steps.reduce((acc, s) => acc + (s.estimate?.executionDuration ?? 0), 0)
  ) : "—";
  const routeVia    = bestRoute?.steps[0]?.toolDetails?.name ?? "—";

  const canBridge = isConnected && !!bestRoute && !executing && !fetching;
  const showRouteSummary = (!!bestRoute || fetching || !!routeErr) && !!amount && parseFloat(amount) > 0;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{
          fontWeight: 900, fontSize: 26, marginBottom: "0.2rem",
          letterSpacing: "0.08em", fontFamily: "'Rajdhani', sans-serif",
        }}>BRIDGE</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'Share Tech Mono', monospace" }}>
          Transfer assets across chains
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: "rgba(4,8,18,0.97)",
        border: "1px solid var(--border)",
        borderTop: "1px solid var(--border-bright)",
        position: "relative",
        clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)",
        padding: "1.25rem",
        animation: "fadeIn 0.3s ease",
      }}>
        {/* Cut-corner accent */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: 16, height: 16,
          borderTop: "1px solid var(--accent)",
          borderRight: "1px solid var(--accent)",
          boxShadow: "2px -2px 8px var(--accent-glow)",
          pointerEvents: "none",
        }} />

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.1rem" }}>
          <Zap size={13} color="var(--accent)" />
          <span style={{
            fontWeight: 900, fontSize: 13, letterSpacing: "0.14em",
            fontFamily: "'Rajdhani', sans-serif",
          }}>CROSS-CHAIN TRANSFER</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <div style={{ width: 5, height: 5, background: "var(--accent)", animation: "punkPulse 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 9, color: "var(--accent)", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.1em" }}>LIVE</span>
          </div>
        </div>

        {/* FROM */}
        <div style={{ marginBottom: "0.5rem" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", marginBottom: "0.35rem" }}>FROM</div>
          <ChainDropdown value={fromChain} onChange={c => { setFromChain(c); setRoutes([]); setBestRoute(null); }} exclude={toChain} />
        </div>

        {/* Amount input */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          background: "var(--bg-input)", border: "1px solid var(--border)",
          borderLeft: `2px solid ${fromChain.color}`,
          padding: "0.75rem 0.85rem", marginBottom: "0.35rem",
        }}>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontSize: 28, fontWeight: 700, color: "var(--text)", minWidth: 0,
              fontFamily: "'Share Tech Mono', monospace",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem" }}>
            <TokenDropdown value={token} onChange={t => { setToken(t); setRoutes([]); setBestRoute(null); }} />
            <button
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.08em",
                fontFamily: "'Share Tech Mono', monospace",
              }}
            >
              MAX
            </button>
          </div>
        </div>

        {/* Flip button */}
        <div style={{ display: "flex", justifyContent: "center", margin: "0.6rem 0" }}>
          <button
            onClick={flip}
            style={{
              background: "var(--bg-deep)", border: "1px solid var(--border)",
              width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-muted)", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 10px var(--accent-glow)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <ArrowDownUp size={13} />
          </button>
        </div>

        {/* TO */}
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", marginBottom: "0.35rem" }}>TO</div>
          <ChainDropdown value={toChain} onChange={c => { setToChain(c); setRoutes([]); setBestRoute(null); }} exclude={fromChain} />
        </div>

        {/* You receive */}
        <div style={{
          background: "var(--bg-input)", border: "1px solid var(--border)",
          borderLeft: `2px solid ${toChain.color}`,
          padding: "0.75rem 0.85rem", marginBottom: "1rem",
          position: "relative",
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", marginBottom: "0.3rem" }}>
            YOU RECEIVE (MIN)
          </div>
          {fetching ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", height: 40 }}>
              <Loader size={16} color="var(--accent)" style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>Fetching best route…</span>
            </div>
          ) : (
            <div style={{ fontSize: 28, fontWeight: 700, color: receiveEst ? "var(--accent)" : "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
              {receiveEst || "0.000000"}
              <span style={{ fontSize: 14, marginLeft: "0.4rem", color: "var(--text-muted)" }}>
                {destToken?.symbol ?? token}
              </span>
              {receiveEstExact && receiveEstExact !== receiveEst && (
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: "0.15rem" }}>
                  exact: {receiveEstExact} {destToken?.symbol ?? token}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Route summary */}
        {showRouteSummary && (
          <div style={{
            borderLeft: "2px solid var(--border)",
            padding: "0.5rem 0.75rem", marginBottom: "1rem",
            background: "rgba(0,0,0,0.2)",
          }}>
            {routeErr ? (
              <div style={{ fontSize: 11, color: "#ff4d6d", fontFamily: "'Share Tech Mono', monospace" }}>
                {routeErr}
              </div>
            ) : fetching ? (
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
                Calculating fees…
              </div>
            ) : bestRoute && [
              { label: "GAS COST",   value: gasCostUSD  ? formatUSD(gasCostUSD)  : "—" },
              { label: "BRIDGE FEE", value: feeCostUSD  ? formatUSD(feeCostUSD)  : "—" },
              { label: "EST. TIME",  value: estTime },
              { label: "ROUTE VIA",  value: routeVia },
              { label: "STEPS",      value: `${bestRoute.steps.length} step${bestRoute.steps.length > 1 ? "s" : ""}` },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: 11 }}>
                <span style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.08em" }}>{r.label}</span>
                <span style={{ fontWeight: 600, color: "var(--text)", fontFamily: "'Share Tech Mono', monospace" }}>{r.value}</span>
              </div>
            ))}
            {routes.length > 1 && !fetching && (
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: "0.3rem", fontFamily: "'Share Tech Mono', monospace" }}>
                {routes.length} routes found · showing best
              </div>
            )}
          </div>
        )}

        {/* Tx hash confirmation */}
        {txHash && (
          <div style={{
            borderLeft: "2px solid #00ff94", padding: "0.45rem 0.65rem", marginBottom: "0.85rem",
            fontSize: 11, color: "#00ff94", fontFamily: "'Share Tech Mono', monospace",
            background: "rgba(0,255,148,0.05)",
          }}>
            TX SUBMITTED · {txHash.slice(0, 10)}…{txHash.slice(-8)}
          </div>
        )}

        {/* Warning */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: "0.5rem",
          borderLeft: "2px solid rgba(255,45,107,0.4)",
          padding: "0.45rem 0.65rem", marginBottom: "0.85rem",
          fontSize: 11, color: "var(--text-muted)",
          fontFamily: "'Share Tech Mono', monospace",
        }}>
          <Info size={11} style={{ flexShrink: 0, marginTop: 1, color: "var(--punk)" }} />
          Always verify destination address. Cross-chain transfers are irreversible.
        </div>

        {/* CTA */}
        <button
          disabled={!canBridge}
          onClick={handleBridge}
          style={{
            width: "100%", padding: "0.9rem",
            border: `1px solid ${canBridge ? "var(--accent)" : "var(--border)"}`,
            background: canBridge ? "var(--accent)" : "transparent",
            color: canBridge ? "var(--bg-deep)" : "var(--text-muted)",
            fontWeight: 900, fontSize: 13, letterSpacing: "0.1em",
            cursor: canBridge ? "pointer" : "not-allowed",
            boxShadow: canBridge ? "0 0 24px var(--accent-glow)" : "none",
            transition: "all 0.15s",
            fontFamily: "'Rajdhani', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
          }}
        >
          {executing && <Loader size={14} style={{ animation: "spin 1s linear infinite" }} />}
          {!isConnected
            ? "CONNECT WALLET"
            : executing
            ? "BRIDGING…"
            : fetching
            ? "FINDING ROUTE…"
            : !amount || parseFloat(amount) <= 0
            ? "ENTER AMOUNT"
            : !bestRoute
            ? routeErr ? "NO ROUTE" : "ENTER AMOUNT"
            : `BRIDGE ${token} · ${fromChain.short} → ${toChain.short}`}
        </button>
      </div>

      {/* Supported chains */}
      <div style={{ marginTop: "1.25rem" }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", marginBottom: "0.6rem" }}>
          SUPPORTED NETWORKS
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {CHAINS.map(c => (
            <div
              key={c.id}
              style={{
                display: "flex", alignItems: "center", gap: "0.35rem",
                padding: "0.3rem 0.6rem",
                border: "1px solid var(--border)",
                fontSize: 10, color: "var(--text-muted)",
                fontFamily: "'Share Tech Mono', monospace",
                background: fromChain.id === c.id || toChain.id === c.id ? `${c.color}12` : "transparent",
                borderColor: fromChain.id === c.id || toChain.id === c.id ? c.color : "var(--border)",
                transition: "all 0.12s",
              }}
            >
              <div style={{ width: 5, height: 5, background: c.color }} />
              {c.short}
            </div>
          ))}
        </div>
      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
