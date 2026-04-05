import { useState, useRef, useEffect } from "react";
import { useChainId, useSwitchChain, useAccount } from "wagmi";
import { ChevronDown, Loader2, AlertTriangle } from "lucide-react";

const CHAIN_META: Record<number, { name: string; short: string; color: string; testnet?: boolean }> = {
  1:        { name: "Ethereum",      short: "ETH",   color: "#627EEA" },
  8453:     { name: "Base",          short: "BASE",  color: "#0052FF" },
  42161:    { name: "Arbitrum",      short: "ARB",   color: "#28A0F0" },
  137:      { name: "Polygon",       short: "POL",   color: "#8247E5" },
  10:       { name: "Optimism",      short: "OP",    color: "#FF0420" },
  56:       { name: "BNB Chain",     short: "BNB",   color: "#F0B90B" },
  10143:    { name: "Monad Testnet", short: "MON",   color: "#836EF9", testnet: true },
  999:      { name: "HyperEVM",      short: "HYPE",  color: "#00ff94" },
  361:      { name: "Plasma",        short: "PLSM",  color: "#7C3AED" },
  4217:     { name: "Tempo",         short: "TEMPO", color: "#0EA5E9" },
  42431:    { name: "Tempo Moderato",short: "TEMPO", color: "#0EA5E9", testnet: true },
  11155111: { name: "Sepolia",       short: "SEP",   color: "#627EEA", testnet: true },
  6342:     { name: "MegaETH",       short: "MEGA",  color: "#FF6B35" },
};

const CHAIN_ORDER = [4217, 11155111];

export default function ChainSwitcher() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isConnected) return null;

  const current = CHAIN_META[chainId];
  const isUnknown = !current;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: "0.45rem",
          padding: "0.3rem 0.7rem",
          background: "transparent",
          border: `1px solid ${isUnknown ? "var(--punk)" : open ? "var(--accent)" : "var(--border)"}`,
          color: isUnknown ? "var(--punk)" : "var(--text)",
          cursor: "pointer",
          fontSize: 11, fontWeight: 700,
          letterSpacing: "0.06em",
          fontFamily: "'Share Tech Mono', monospace",
          transition: "all 0.12s",
          boxShadow: open ? "0 0 12px var(--accent-glow)" : "none",
          height: 32,
        }}
      >
        {isPending ? (
          <Loader2 size={10} style={{ animation: "spin 0.8s linear infinite" }} />
        ) : isUnknown ? (
          <AlertTriangle size={10} color="var(--punk)" />
        ) : (
          <div style={{
            width: 8, height: 8,
            background: current.color,
            boxShadow: `0 0 6px ${current.color}88`,
            flexShrink: 0,
          }} />
        )}
        <span style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {isPending ? "SWITCHING" : isUnknown ? "WRONG NET" : current.short}
        </span>
        <ChevronDown
          size={10}
          style={{ transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "none", opacity: 0.6 }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          right: 0,
          width: 220,
          background: "rgba(4,8,18,0.98)",
          border: "1px solid var(--border)",
          borderTop: "1px solid var(--accent)",
          zIndex: 200,
          boxShadow: "0 8px 40px rgba(0,0,0,0.7), 0 0 30px rgba(202,228,219,0.05)",
          animation: "fadeIn 0.15s ease",
        }}>
          {/* Header */}
          <div style={{
            padding: "0.5rem 0.75rem",
            borderBottom: "1px solid var(--border)",
            fontSize: 9, fontWeight: 700, letterSpacing: "0.2em",
            color: "var(--text-muted)",
            fontFamily: "'Share Tech Mono', monospace",
          }}>
            SELECT NETWORK
          </div>

          {/* Mainnet chains */}
          <div style={{ padding: "0.25rem 0" }}>
            {CHAIN_ORDER.filter(id => !CHAIN_META[id]?.testnet).map(id => {
              const chain = CHAIN_META[id];
              if (!chain) return null;
              const isActive = chainId === id;
              return (
                <button
                  key={id}
                  onClick={() => { switchChain({ chainId: id }); setOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "0.65rem",
                    padding: "0.55rem 0.75rem",
                    background: isActive ? `${chain.color}12` : "transparent",
                    border: "none",
                    borderLeft: `3px solid ${isActive ? chain.color : "transparent"}`,
                    color: isActive ? chain.color : "var(--text-muted)",
                    cursor: "pointer", textAlign: "left",
                    fontSize: 12, fontWeight: isActive ? 700 : 500,
                    transition: "all 0.1s",
                    letterSpacing: "0.02em",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.color = "var(--text)";
                      e.currentTarget.style.borderLeftColor = chain.color + "66";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-muted)";
                      e.currentTarget.style.borderLeftColor = "transparent";
                    }
                  }}
                >
                  <div style={{ width: 8, height: 8, background: chain.color, boxShadow: isActive ? `0 0 8px ${chain.color}` : "none", flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{chain.name}</span>
                  <span style={{
                    fontSize: 9, letterSpacing: "0.1em",
                    color: isActive ? chain.color : "var(--text-muted)",
                    fontFamily: "'Share Tech Mono', monospace",
                  }}>{chain.short}</span>
                  {isActive && (
                    <div style={{ width: 4, height: 4, background: chain.color, boxShadow: `0 0 6px ${chain.color}` }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Testnets */}
          <div style={{ borderTop: "1px solid var(--border)" }}>
            <div style={{
              padding: "0.4rem 0.75rem 0.2rem",
              fontSize: 9, letterSpacing: "0.16em",
              color: "var(--text-muted)",
              fontFamily: "'Share Tech Mono', monospace",
            }}>TESTNETS</div>
            {CHAIN_ORDER.filter(id => CHAIN_META[id]?.testnet).map(id => {
              const chain = CHAIN_META[id];
              if (!chain) return null;
              const isActive = chainId === id;
              return (
                <button
                  key={id}
                  onClick={() => { switchChain({ chainId: id }); setOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "0.65rem",
                    padding: "0.5rem 0.75rem",
                    background: isActive ? `${chain.color}12` : "transparent",
                    border: "none",
                    borderLeft: `3px solid ${isActive ? chain.color : "transparent"}`,
                    color: isActive ? chain.color : "var(--text-muted)",
                    cursor: "pointer", textAlign: "left",
                    fontSize: 11, fontWeight: isActive ? 700 : 400,
                    transition: "all 0.1s",
                    opacity: 0.75,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.opacity = "0.75";
                    }
                  }}
                >
                  <div style={{ width: 8, height: 8, background: chain.color, opacity: 0.7, flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{chain.name}</span>
                  <span style={{ fontSize: 9, fontFamily: "'Share Tech Mono', monospace", color: "var(--text-muted)" }}>{chain.short}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
