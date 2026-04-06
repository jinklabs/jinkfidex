import { Link } from "react-router-dom";
import {
  ArrowLeftRight, Droplets, TrendingUp, Coins, Layers,
  Lock, Trophy, ArrowRightLeft, Zap, Shield, Globe,
  ChevronRight, ExternalLink, Rocket,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { poolApi, farmApi } from "../api/client";

function useLandingStats() {
  const { data: pools } = useQuery({ queryKey: ["pools", 4217], queryFn: () => poolApi.list(4217), staleTime: 60_000, retry: false });
  const { data: farms } = useQuery({ queryKey: ["farms", 4217], queryFn: () => farmApi.list(4217), staleTime: 60_000, retry: false });

  const tvl   = pools ? pools.reduce((s, p) => s + (p.tvlUSD ?? 0), 0) : null;
  const vol24 = pools ? pools.reduce((s, p) => s + (p.volume24h ?? 0), 0) : null;

  function fmtUSD(n: number) {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(2)}`;
  }

  return {
    tvl:    tvl   !== null && tvl   > 0 ? fmtUSD(tvl)   : "—",
    vol24:  vol24 !== null && vol24 > 0 ? fmtUSD(vol24) : "—",
    farms:  farms ? String(farms.length) : "—",
  };
}

const FEATURES = [
  { to: "/swap",    icon: ArrowLeftRight, label: "Swap",        color: "#7c5cfc", tag: "V2 · V3",        desc: "Best-price routing across V2 and V3 pools with zero protocol fees." },
  { to: "/pool",    icon: Droplets,       label: "Liquidity",   color: "#38bdf8", tag: "Up to 120% APR", desc: "Provide V2 or concentrated V3 liquidity and earn from every trade." },
  { to: "/perps",   icon: TrendingUp,     label: "Perpetuals",  color: "#f472b6", tag: "100x Leverage",  desc: "Trade perpetual futures on major pairs with oracle-based pricing." },
  { to: "/staking", icon: Coins,          label: "Staking",     color: "#a78bfa", tag: "Fixed APY",      desc: "Stake into audited pools with guaranteed fixed lock-tier yields." },
  { to: "/farm",    icon: Layers,         label: "Farming",     color: "#34d399", tag: "LP Rewards",     desc: "Deposit LP tokens to earn JINK emissions on top of trading fees." },
  { to: "/locker",  icon: Lock,           label: "Locker",      color: "#fb923c", tag: "Non-Custodial",  desc: "Time-lock tokens or LP positions directly on-chain, no middleman." },
  { to: "/quests",  icon: Trophy,         label: "Quests",      color: "#eab308", tag: "Earn XP",        desc: "Complete protocol tasks to earn XP and unlock exclusive rewards." },
  { to: "/bridge",  icon: ArrowRightLeft, label: "Bridge",      color: "#22d3ee", tag: "Multi-chain",    desc: "Move assets across Ethereum, Base, and Arbitrum in seconds." },
];


const WHY = [
  { icon: Shield,      color: "#34d399", title: "Non-Custodial",  body: "Your keys, your tokens. Every transaction is signed locally — nothing leaves your wallet without your approval." },
  { icon: Zap,         color: "#7c5cfc", title: "Gas Optimised",  body: "Smart routing selects the most capital-efficient path. Minimal slippage, minimal gas, maximum output." },
  { icon: Globe,       color: "#38bdf8", title: "Multi-chain",    body: "Native on Tempo Mainnet. Bridges natively to Ethereum, Base, and Arbitrum with one click." },
  { icon: ExternalLink,color: "#f472b6", title: "Open Protocol",  body: "Permissionless by design. Any project can list staking pools, perp markets, or quests directly." },
];

export default function LandingPage() {
  const stats = useLandingStats();

  const STATS = [
    { value: stats.tvl,   label: "Total Value Locked" },
    { value: stats.vol24, label: "24h Volume"         },
    { value: "8",         label: "Protocol Features"  },
    { value: "4",         label: "Supported Chains"   },
  ];

  return (
    <div style={{ background: "var(--bg-deep)", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem", height: 56,
        background: "rgba(8,10,18,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <img
          src="https://i.ibb.co/gZdKMXtL/Jink-FI-logo-with-lightning-bolt-design.png"
          alt="JinkFi"
          style={{ width: 90, height: "auto", filter: "brightness(1.1) drop-shadow(0 0 6px rgba(212,175,55,0.3))", mixBlendMode: "lighten" }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <a href="https://docs.jinkfi.xyz/" target="_blank" rel="noreferrer"
            style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none", padding: "0 0.5rem" }}
          >Docs</a>
          <a href="https://x.com/JinkFi" target="_blank" rel="noreferrer"
            style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none", padding: "0 0.5rem" }}
          >Twitter</a>
          <Link to="/swap" style={{
            display: "inline-flex", alignItems: "center", gap: "0.3rem",
            padding: "0.45rem 1.1rem",
            background: "var(--accent)", color: "var(--bg-deep)",
            fontWeight: 700, fontSize: 12, letterSpacing: "0.04em",
            textDecoration: "none", borderRadius: 4,
            boxShadow: "0 0 16px var(--accent-glow)",
          }}>
            Launch App
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center",
        padding: "7rem 1.5rem 4rem",
        overflow: "hidden",
      }}>
        {/* Grid background */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(124,92,252,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,92,252,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }} />

        {/* Radial glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(124,92,252,0.12) 0%, transparent 70%)",
        }} />

        {/* Bottom fade */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 200, pointerEvents: "none",
          background: "linear-gradient(to bottom, transparent, var(--bg-deep))",
        }} />

        {/* Live badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.45rem",
          border: "1px solid rgba(124,92,252,0.25)",
          background: "rgba(124,92,252,0.07)",
          padding: "0.3rem 0.9rem",
          borderRadius: 100, marginBottom: "1.5rem",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.16em",
          color: "var(--neon)",
          fontFamily: "'Share Tech Mono', monospace",
          position: "relative",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#4ade80", flexShrink: 0,
            boxShadow: "0 0 8px #4ade80",
            animation: "pulse 2s ease-in-out infinite",
          }} />
          LIVE ON TEMPO MAINNET
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(2.6rem, 7vw, 5rem)",
          fontWeight: 900, lineHeight: 1.04, letterSpacing: "-0.04em",
          margin: "0 0 1.25rem", maxWidth: 760, position: "relative",
        }}>
          <span style={{ color: "var(--text)" }}>The Complete</span>
          <br />
          <span style={{
            background: "linear-gradient(135deg, #7c5cfc 0%, #c084fc 45%, #38bdf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>DeFi Terminal</span>
        </h1>

        <p style={{
          fontSize: 15, color: "var(--text-muted)", maxWidth: 500,
          lineHeight: 1.7, margin: "0 auto 2.5rem", position: "relative",
        }}>
          Swap, pool, farm, stake, lock, bridge, and trade perpetuals —
          all in one permissionless interface on Tempo.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center", position: "relative" }}>
          <Link to="/swap" style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            padding: "0.75rem 1.75rem",
            background: "var(--accent)", color: "#fff",
            fontWeight: 700, fontSize: 14, letterSpacing: "0.03em",
            textDecoration: "none", borderRadius: 6,
            boxShadow: "0 0 32px var(--accent-glow), 0 4px 24px rgba(0,0,0,0.4)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 48px var(--accent-glow), 0 8px 32px rgba(0,0,0,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 0 32px var(--accent-glow), 0 4px 24px rgba(0,0,0,0.4)"; }}
          >
            Launch App <ChevronRight size={15} />
          </Link>
          <a href="https://docs.jinkfi.xyz/" target="_blank" rel="noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            padding: "0.75rem 1.75rem",
            background: "transparent", color: "var(--text)",
            fontWeight: 600, fontSize: 14,
            textDecoration: "none", borderRadius: 6,
            border: "1px solid var(--border)",
            transition: "border-color 0.15s, background 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "transparent"; }}
          >
            <ExternalLink size={14} /> Read Docs
          </a>
        </div>

        {/* Scroll hint */}
        <div style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", opacity: 0.35 }}>
          <div style={{ width: 1, height: 36, background: "linear-gradient(to bottom, transparent, var(--accent))" }} />
          <div style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>SCROLL</div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{
        borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
        background: "var(--bg-card)",
      }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              padding: "1.75rem 1.25rem", textAlign: "center",
              borderRight: i < 3 ? "1px solid var(--border)" : "none",
            }}>
              <div style={{
                fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 900,
                background: "linear-gradient(135deg, var(--text) 0%, var(--neon) 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                lineHeight: 1, marginBottom: "0.4rem",
                fontFamily: "'Share Tech Mono', monospace",
              }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "5rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "var(--accent)", marginBottom: "0.65rem", fontFamily: "'Share Tech Mono', monospace" }}>
            PROTOCOL FEATURES
          </div>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 900, letterSpacing: "-0.03em", margin: 0 }}>
            Everything in one place
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: "0.6rem", maxWidth: 440, margin: "0.6rem auto 0" }}>
            Eight interconnected DeFi primitives, one unified interface.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "1px",
          background: "var(--border)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "hidden",
        }}>
          {FEATURES.map(f => (
            <Link key={f.to} to={f.to} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "var(--bg-card)",
                  padding: "1.4rem 1.25rem",
                  height: "100%", boxSizing: "border-box",
                  transition: "background 0.15s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card)"; }}
              >
                {/* Accent corner */}
                <div style={{ position: "absolute", top: 0, right: 0, width: 40, height: 40, background: `radial-gradient(circle at top right, ${f.color}20 0%, transparent 70%)`, pointerEvents: "none" }} />

                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: `${f.color}15`, border: `1px solid ${f.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "0.85rem", flexShrink: 0,
                }}>
                  <f.icon size={17} color={f.color} />
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: "var(--text)" }}>{f.label}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: f.color, fontFamily: "'Share Tech Mono', monospace" }}>{f.tag}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── WHY JINKFI ── */}
      <section style={{
        background: "var(--bg-card)",
        borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
        padding: "4rem 1.5rem",
      }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "var(--accent)", marginBottom: "0.65rem", fontFamily: "'Share Tech Mono', monospace" }}>WHY JINKFI</div>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 900, letterSpacing: "-0.03em", margin: 0 }}>Built different</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1px", background: "var(--border)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
            {WHY.map(item => (
              <div key={item.title} style={{
                background: "var(--bg-deep)",
                padding: "1.75rem 1.4rem",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${item.color}60, transparent)` }} />
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${item.color}12`, border: `1px solid ${item.color}22`,
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem",
                }}>
                  <item.icon size={18} color={item.color} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text)", marginBottom: "0.5rem" }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.65 }}>{item.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "4rem 1.5rem 5rem" }}>
        <div style={{
          position: "relative",
          background: "var(--bg-card)",
          border: "1px solid var(--border-bright)",
          borderRadius: 16,
          padding: "3.5rem 2rem",
          textAlign: "center",
          overflow: "hidden",
        }}>
          {/* Background glows */}
          <div style={{ position: "absolute", top: "-40%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(124,92,252,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-30%", left: "15%", width: 300, height: 200, background: "radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-30%", right: "15%", width: 300, height: 200, background: "radial-gradient(ellipse, rgba(196,181,253,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "var(--accent)", marginBottom: "0.65rem", fontFamily: "'Share Tech Mono', monospace" }}>GET STARTED</div>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 0.75rem" }}>
              Ready to trade?
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 420, margin: "0 auto 2.25rem", lineHeight: 1.7 }}>
              Connect your wallet and explore the full JinkFi protocol on Tempo Mainnet — no sign-up, no KYC, fully on-chain.
            </p>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
              <Link to="/swap" style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                padding: "0.75rem 1.75rem",
                background: "var(--accent)", color: "#fff",
                fontWeight: 700, fontSize: 14, textDecoration: "none", borderRadius: 6,
                boxShadow: "0 0 28px var(--accent-glow)", transition: "transform 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
              >
                Start Swapping <ChevronRight size={15} />
              </Link>
              <Link to="/quests" style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                padding: "0.75rem 1.75rem", background: "transparent", color: "#eab308",
                fontWeight: 600, fontSize: 14, textDecoration: "none", borderRadius: 6,
                border: "1px solid rgba(234,179,8,0.3)", transition: "background 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(234,179,8,0.07)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <Trophy size={14} /> Earn Quests
              </Link>
              <a href="https://jink.fun" target="_blank" rel="noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                padding: "0.75rem 1.75rem", background: "transparent", color: "var(--text-muted)",
                fontWeight: 600, fontSize: 14, textDecoration: "none", borderRadius: 6,
                border: "1px solid var(--border)", transition: "background 0.15s, color 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "var(--text)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                <Rocket size={14} /> Launchpad
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "1.5rem 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem",
      }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
          Powered by{" "}
          <a href="http://jinklabs.xyz/" target="_blank" rel="noreferrer" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 700 }}>Jinklabs.xyz</a>
        </div>
        <div style={{ display: "flex", gap: "1.25rem" }}>
          {[
            { href: "https://docs.jinkfi.xyz/",     label: "Docs"    },
            { href: "https://x.com/JinkFi",        label: "Twitter" },
            { href: "https://jink.fun",             label: "Launchpad" },
          ].map(l => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer"
              style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none", transition: "color 0.12s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; }}
            >{l.label}</a>
          ))}
        </div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", opacity: 0.5 }}>
          v3.0 · Tempo Mainnet
        </div>
      </footer>

    </div>
  );
}
