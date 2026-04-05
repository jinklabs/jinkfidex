import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, useBalance, useDisconnect, useChainId } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { Copy, ExternalLink, LogOut, Check, ChevronDown, Wallet, User } from "lucide-react";

const CHAIN_META: Record<number, { name: string; color: string }> = {
  1:        { name: "Ethereum",      color: "#627EEA" },
  8453:     { name: "Base",          color: "#0052FF" },
  42161:    { name: "Arbitrum",      color: "#28A0F0" },
  137:      { name: "Polygon",       color: "#8247E5" },
  10:       { name: "Optimism",      color: "#FF0420" },
  56:       { name: "BNB Chain",     color: "#F0B90B" },
  10143:    { name: "Monad Testnet", color: "#836EF9" },
  999:      { name: "HyperEVM",      color: "#00ff94" },
  361:      { name: "Plasma",        color: "#7C3AED" },
  4217:     { name: "Tempo",         color: "#0EA5E9" },
  6342:     { name: "MegaETH",       color: "#FF6B35" },
  11155111: { name: "Sepolia",       color: "#627EEA" },
};

function truncate(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function WalletButton() {
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { login } = usePrivy();
  const navigate = useNavigate();
  const { data: balance } = useBalance({ address });
  const [dropOpen, setDropOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const chain = CHAIN_META[chainId];
  const bal = balance ? (Number(balance.value) / 10 ** balance.decimals).toFixed(4) : "0.0000";

  // ── Disconnected ──────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <button
        onClick={() => login()}
        style={{
          display: "flex", alignItems: "center", gap: "0.45rem",
          padding: "0.35rem 0.9rem",
          background: "var(--accent)",
          border: "none",
          color: "var(--bg-deep)",
          cursor: "pointer",
          fontSize: 11, fontWeight: 900,
          letterSpacing: "0.1em",
          fontFamily: "'Rajdhani', sans-serif",
          boxShadow: "0 0 20px var(--accent-glow)",
          transition: "all 0.15s",
          height: 32,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "var(--neon)";
          e.currentTarget.style.boxShadow = "0 0 28px var(--accent-glow)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "var(--accent)";
          e.currentTarget.style.boxShadow = "0 0 20px var(--accent-glow)";
        }}
      >
        <Wallet size={11} />
        CONNECT
      </button>
    );
  }

  // ── Connected ─────────────────────────────────────────────────────────────
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setDropOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          padding: "0 0.75rem",
          background: "transparent",
          border: `1px solid ${dropOpen ? "var(--accent)" : "var(--border)"}`,
          color: "var(--text)",
          cursor: "pointer", height: 32,
          transition: "all 0.12s",
          boxShadow: dropOpen ? "0 0 12px var(--accent-glow)" : "none",
        }}
      >
        {/* Chain dot */}
        {chain && (
          <div style={{ width: 6, height: 6, background: chain.color, boxShadow: `0 0 5px ${chain.color}88`, flexShrink: 0 }} />
        )}

        {/* Balance */}
        <span style={{
          fontSize: 11, color: "var(--text-muted)",
          fontFamily: "'Share Tech Mono', monospace",
        }}>
          {bal} {balance?.symbol ?? "ETH"}
        </span>

        {/* Divider */}
        <div style={{ width: 1, height: 14, background: "var(--border)" }} />

        {/* Address */}
        <span style={{
          fontSize: 11, fontWeight: 700, color: "var(--accent)",
          fontFamily: "'Share Tech Mono', monospace",
          letterSpacing: "0.02em",
        }}>
          {address ? truncate(address) : ""}
        </span>

        <ChevronDown
          size={10}
          style={{ opacity: 0.5, transition: "transform 0.15s", transform: dropOpen ? "rotate(180deg)" : "none" }}
        />
      </button>

      {/* Dropdown */}
      {dropOpen && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          right: 0,
          width: 260,
          background: "rgba(4,8,18,0.99)",
          border: "1px solid var(--border)",
          borderTop: "1px solid var(--accent)",
          zIndex: 200,
          boxShadow: "0 12px 40px rgba(0,0,0,0.8), 0 0 30px rgba(202,228,219,0.04)",
          animation: "fadeIn 0.15s ease",
        }}>

          {/* Address row */}
          <div style={{ padding: "0.9rem 0.85rem 0.75rem", borderBottom: "1px solid var(--border)" }}>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
              color: "var(--text-muted)", marginBottom: "0.4rem",
              fontFamily: "'Share Tech Mono', monospace",
            }}>WALLET</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{
                flex: 1, fontSize: 12, fontWeight: 700,
                color: "var(--accent)",
                fontFamily: "'Share Tech Mono', monospace",
                letterSpacing: "0.03em",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {address}
              </span>
              <button
                onClick={copyAddress}
                title="Copy address"
                style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "var(--accent)" : "var(--text-muted)", padding: "0.15rem", flexShrink: 0, transition: "color 0.15s" }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </button>
              <a
                href={`https://etherscan.io/address/${address}`}
                target="_blank"
                rel="noreferrer"
                title="View on explorer"
                style={{ color: "var(--text-muted)", display: "flex", alignItems: "center" }}
              >
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Balance */}
          <div style={{ padding: "0.75rem 0.85rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>BALANCE</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", fontFamily: "'Share Tech Mono', monospace" }}>
              {bal} <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{balance?.symbol ?? "ETH"}</span>
            </span>
          </div>

          {/* Network */}
          <div style={{ padding: "0.75rem 0.85rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>NETWORK</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {chain && <div style={{ width: 7, height: 7, background: chain.color, boxShadow: `0 0 6px ${chain.color}` }} />}
              <span style={{ fontSize: 12, fontWeight: 700, color: chain?.color ?? "var(--punk)" }}>
                {chain?.name ?? "Unknown"}
              </span>
            </div>
          </div>

          {/* Connector */}
          {connector && (
            <div style={{ padding: "0.75rem 0.85rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>VIA</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{connector.name}</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ padding: "0.5rem" }}>
            <button
              onClick={() => { navigate("/profile"); setDropOpen(false); }}
              style={{
                width: "100%", padding: "0.5rem 0.75rem",
                background: "transparent", border: "1px solid var(--border)",
                color: "var(--text-muted)", cursor: "pointer",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                fontFamily: "'Share Tech Mono', monospace",
                marginBottom: "0.35rem",
                transition: "all 0.12s",
                textAlign: "left",
                display: "flex", alignItems: "center", gap: "0.4rem",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <User size={11} /> VIEW PROFILE
            </button>
            <button
              onClick={() => { disconnect(); setDropOpen(false); }}
              style={{
                width: "100%", padding: "0.5rem 0.75rem",
                background: "var(--punk-dim)", border: "1px solid var(--punk)",
                color: "var(--punk)", cursor: "pointer",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                fontFamily: "'Share Tech Mono', monospace",
                display: "flex", alignItems: "center", gap: "0.4rem",
                transition: "all 0.12s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,45,107,0.15)"; e.currentTarget.style.boxShadow = "0 0 12px var(--punk-glow)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--punk-dim)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <LogOut size={11} /> DISCONNECT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
