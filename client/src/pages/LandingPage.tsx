import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftRight, Droplets, TrendingUp, Coins, Layers,
  Lock, Trophy, ArrowRightLeft, Zap, Shield, Globe,
  ChevronRight, ExternalLink,
} from "lucide-react";

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedStat({ end, prefix = "", suffix = "", label }: {
  end: number; prefix?: string; suffix?: string; label: string;
}) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const dur = 1600, t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 4);
          setVal(Math.round(end * ease));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1 }}>
        {prefix}{val >= 1000 ? val.toLocaleString() : val}{suffix}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// ── Floating token orbs (hero bg decoration) ──────────────────────────────────
function FloatingOrbs() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {[
        { size: 300, x: "10%",  y: "20%",  color: "rgba(124,92,252,0.06)",  dur: 8 },
        { size: 200, x: "75%",  y: "10%",  color: "rgba(56,189,248,0.05)",  dur: 12 },
        { size: 180, x: "85%",  y: "60%",  color: "rgba(212,175,55,0.05)",  dur: 10 },
        { size: 250, x: "30%",  y: "70%",  color: "rgba(52,211,153,0.04)",  dur: 14 },
      ].map((o, i) => (
        <div key={i} style={{
          position: "absolute",
          width: o.size, height: o.size,
          left: o.x, top: o.y,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
          animation: `float${i} ${o.dur}s ease-in-out infinite`,
        }} />
      ))}
      <style>{`
        @keyframes float0 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-30px)} }
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-25px,20px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,25px)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,-20px)} }
      `}</style>
    </div>
  );
}

// ── Feature card data ─────────────────────────────────────────────────────────
const FEATURES = [
  {
    to: "/swap",    icon: ArrowLeftRight, label: "Swap",
    color: "#7c5cfc", tag: "V2 · V3",
    desc: "Best-price routing across V2 and concentrated V3 pools. Multi-hop paths for optimal execution.",
  },
  {
    to: "/pool",    icon: Droplets, label: "Liquidity",
    color: "#38bdf8", tag: "Up to 120% APR",
    desc: "Provide V2 or V3 concentrated liquidity. Earn swap fees proportional to your share.",
  },
  {
    to: "/perps",   icon: TrendingUp, label: "Perpetuals",
    color: "#f472b6", tag: "100x Leverage",
    desc: "Trade perpetual futures on any token. Pyth & Chainlink oracle pricing. Up to 100× leverage.",
  },
  {
    to: "/staking", icon: Coins, label: "Staking",
    color: "#a78bfa", tag: "Fixed & Variable APY",
    desc: "Stake in third-party audited pools. Fixed lock periods for higher yield multipliers.",
  },
  {
    to: "/farm",    icon: Layers, label: "Farming",
    color: "#34d399", tag: "LP Rewards",
    desc: "Deposit LP tokens to earn JINK rewards on top of your swap fee income.",
  },
  {
    to: "/locker",  icon: Lock, label: "Locker",
    color: "#fb923c", tag: "Non-Custodial",
    desc: "Time-lock tokens or LP positions on-chain. Prove commitment to your community.",
  },
  {
    to: "/quests",  icon: Trophy, label: "Quests",
    color: "#eab308", tag: "Earn XP",
    desc: "Complete on-chain and social tasks to earn XP and protocol rewards.",
  },
  {
    to: "/bridge",  icon: ArrowRightLeft, label: "Bridge",
    color: "#22d3ee", tag: "Multi-chain",
    desc: "Move assets across Ethereum, Base, Arbitrum, and more via Li.Fi bridge aggregation.",
  },
];

const WHY = [
  { icon: Shield,   color: "#34d399", title: "Non-Custodial",    body: "Your keys, your tokens. All transactions are signed locally. We never hold funds or require deposits." },
  { icon: Zap,      color: "#7c5cfc", title: "Gas Optimised",    body: "Smart routing reduces hops and selects optimal pools. V3 concentrated liquidity cuts slippage." },
  { icon: Globe,    color: "#38bdf8", title: "Multi-chain",      body: "Native on Tempo with support for Ethereum, Base, and Arbitrum. One interface, any chain." },
  { icon: ExternalLink, color: "#f472b6", title: "Open Protocol", body: "Any project can list quests, staking pools, or perp markets. Submissions are permissionless and reviewed on-chain." },
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div>

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section style={{
        position: "relative",
        minHeight: "92vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center",
        padding: "6rem 1.5rem 4rem",
        overflow: "hidden",
      }}>
        <FloatingOrbs />

        {/* Live badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          border: "1px solid rgba(212,175,55,0.35)",
          background: "rgba(212,175,55,0.06)",
          padding: "0.35rem 1rem",
          borderRadius: 100,
          fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
          color: "var(--accent)", marginBottom: "1.75rem",
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "var(--accent)",
            boxShadow: "0 0 8px var(--accent)",
            animation: "heroPulse 2s ease-in-out infinite",
          }} />
          LIVE ON TEMPO MAINNET
          <style>{`@keyframes heroPulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          margin: "0 0 1.5rem",
          maxWidth: 800,
        }}>
          <span style={{ color: "var(--text)" }}>The Complete</span>
          <br />
          <span style={{
            background: "linear-gradient(135deg, var(--accent) 0%, #c084fc 50%, #38bdf8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            DeFi Terminal
          </span>
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: "clamp(1rem, 2vw, 1.2rem)",
          color: "var(--text-muted)",
          maxWidth: 540,
          lineHeight: 1.7,
          margin: "0 auto 2.5rem",
          fontWeight: 400,
        }}>
          Swap, pool, farm, stake, lock, bridge, and trade perpetuals —
          all in one permissionless interface on Tempo.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Link to="/swap" style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.875rem 2rem",
            background: "var(--accent)", color: "var(--bg-deep)",
            fontWeight: 700, fontSize: 14, letterSpacing: "0.05em",
            textDecoration: "none", borderRadius: 10,
            boxShadow: "0 0 32px var(--accent-glow), 0 4px 20px rgba(0,0,0,0.3)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 48px var(--accent-glow), 0 8px 30px rgba(0,0,0,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 0 32px var(--accent-glow), 0 4px 20px rgba(0,0,0,0.3)"; }}
          >
            Launch App <ChevronRight size={16} />
          </Link>
          <a href="https://x.com/JinkFi" target="_blank" rel="noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.875rem 2rem",
            background: "transparent", color: "var(--text)",
            fontWeight: 600, fontSize: 14,
            textDecoration: "none", borderRadius: 10,
            border: "1px solid var(--border)",
            transition: "border-color 0.15s, background 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "transparent"; }}
          >
            Learn More
          </a>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)" }}>
          <div style={{
            width: 24, height: 40, border: "2px solid rgba(255,255,255,0.12)", borderRadius: 12,
            display: "flex", justifyContent: "center", paddingTop: 6,
          }}>
            <div style={{
              width: 3, height: 8, background: "rgba(255,255,255,0.3)", borderRadius: 2,
              animation: "scrollDot 1.8s ease-in-out infinite",
            }} />
            <style>{`@keyframes scrollDot{0%{transform:translateY(0);opacity:1}100%{transform:translateY(12px);opacity:0}}`}</style>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────────── */}
      <section style={{
        background: "var(--bg-card)",
        borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
        padding: "3rem 1.5rem",
      }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "2rem",
        }}>
          <AnimatedStat end={28}   prefix="$" suffix="M+" label="Total Value Locked"  />
          <AnimatedStat end={142}  prefix="$" suffix="M"  label="Volume (24h)"        />
          <AnimatedStat end={8}                            label="Protocol Features"  />
          <AnimatedStat end={4}                            label="Supported Chains"   />
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "5rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.15em", color: "var(--accent)", marginBottom: "0.75rem" }}>
            WHAT YOU CAN DO
          </div>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
            Everything in one place
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1.5px",
          background: "var(--border)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          overflow: "hidden",
        }}>
          {FEATURES.map(f => (
            <Link key={f.to} to={f.to} style={{ textDecoration: "none" }}>
              <div style={{
                background: "var(--bg-card)",
                padding: "1.5rem",
                height: "100%", boxSizing: "border-box",
                transition: "background 0.15s",
                cursor: "pointer",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card)"; }}
              >
                {/* Icon row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: `${f.color}18`,
                    border: `1px solid ${f.color}35`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <f.icon size={18} color={f.color} />
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
                    color: f.color, border: `1px solid ${f.color}35`,
                    background: `${f.color}10`, padding: "3px 8px", borderRadius: 4,
                  }}>{f.tag}</span>
                </div>

                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: "0.5rem" }}>
                  {f.label}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {f.desc}
                </div>

                <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: "0.35rem", color: f.color, fontSize: 12, fontWeight: 600 }}>
                  Open <ChevronRight size={13} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── WHY JINKFI ────────────────────────────────────────────────────────── */}
      <section style={{
        background: "var(--bg-card)",
        borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
        padding: "5rem 1.5rem",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.15em", color: "var(--accent)", marginBottom: "0.75rem" }}>
              WHY JINKFI
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
              Built different
            </h2>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem",
          }}>
            {WHY.map(item => (
              <div key={item.title} style={{
                background: "var(--bg-deep)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: "1.75rem",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: `${item.color}15`,
                  border: `1px solid ${item.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "1rem",
                }}>
                  <item.icon size={20} color={item.color} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: "0.5rem" }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>
                  {item.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "5rem 1.5rem" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(124,92,252,0.12) 0%, rgba(212,175,55,0.08) 50%, rgba(56,189,248,0.08) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "4rem 2rem",
          textAlign: "center",
          position: "relative", overflow: "hidden",
        }}>
          {/* Glow */}
          <div style={{
            position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)",
            width: 600, height: 400,
            background: "radial-gradient(ellipse, rgba(212,175,55,0.08) 0%, transparent 65%)",
            pointerEvents: "none",
          }} />

          <h2 style={{
            fontSize: "clamp(1.8rem, 4vw, 3rem)",
            fontWeight: 800, letterSpacing: "-0.02em",
            margin: "0 0 1rem",
          }}>
            Ready to trade?
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 15, maxWidth: 420, margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
            Connect your wallet and start exploring the full JinkFi protocol on Tempo.
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link to="/swap" style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.875rem 2.25rem",
              background: "var(--accent)", color: "var(--bg-deep)",
              fontWeight: 700, fontSize: 14,
              textDecoration: "none", borderRadius: 10,
              boxShadow: "0 0 28px var(--accent-glow)",
              transition: "transform 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
            >
              Start Swapping <ChevronRight size={16} />
            </Link>
            <Link to="/quests" style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.875rem 2.25rem",
              background: "transparent", color: "#eab308",
              fontWeight: 600, fontSize: 14,
              textDecoration: "none", borderRadius: 10,
              border: "1px solid rgba(234,179,8,0.35)",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(234,179,8,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <Trophy size={15} /> Earn Quests
            </Link>
            <Link to="/staking/create" style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.875rem 2.25rem",
              background: "transparent", color: "var(--text-muted)",
              fontWeight: 600, fontSize: 14,
              textDecoration: "none", borderRadius: 10,
              border: "1px solid var(--border)",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              List Your Project
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
