import { NavLink, useLocation } from "react-router-dom";
import {
  ArrowLeftRight, Droplets, TrendingUp, Layers,
  Lock, Trophy, ExternalLink, X, Coins, BarChart2,
  Rocket, ArrowRightLeft, User, Plus, ChevronLeft, ChevronRight, Home, Activity,
} from "lucide-react";
import { useIsAdmin } from "../../hooks/useIsAdmin";

const NAV = [
  { to: "/",            icon: Home,           label: "Home"        },
  { to: "/swap",        icon: ArrowLeftRight, label: "Swap"        },
  { to: "/pool",        icon: Droplets,       label: "Pool"        },
  { to: "/perps",       icon: TrendingUp,     label: "Perps",      badge: "100x" },
  { to: "/bridge",      icon: ArrowRightLeft, label: "Bridge"      },
  { to: "/staking",     icon: Coins,          label: "Staking",    badge: "APY"  },
  { to: "/farm",        icon: Layers,         label: "Farm"        },
  { to: "/locker",      icon: Lock,           label: "Locker"      },
  { to: "/quests",      icon: Trophy,         label: "Quests"      },
  { to: "/analytics",   icon: Activity,       label: "Analytics"   },
  { to: "/leaderboard", icon: BarChart2,      label: "Leaderboard" },
  { to: "/profile",     icon: User,           label: "Profile"     },
];

const ACTIVE_BG  = "rgba(212,175,55,0.08)";
const SUB_ACTIVE = "rgba(212,175,55,0.06)";

interface Props {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

function Submenu({ to, label, onClose }: { to: string; label: string; onClose?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClose}
      style={({ isActive }) => ({
        display: "flex", alignItems: "center", gap: "0.5rem",
        padding: "0.4rem 0.75rem 0.4rem 2.25rem",
        textDecoration: "none",
        fontSize: 12,
        color: isActive ? "var(--accent)" : "var(--text-muted)",
        background: isActive ? SUB_ACTIVE : "transparent",
        borderLeft: `3px solid ${isActive ? "var(--accent)" : "transparent"}`,
        transition: "all 0.12s",
      })}
    >
      {({ isActive }) => (
        <>
          <Plus size={11} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.45 }} color={isActive ? "var(--accent)" : undefined} />
          <span>{label}</span>
          <span style={{
            fontSize: 7, fontWeight: 800, letterSpacing: "0.1em",
            color: "var(--punk)", border: "1px solid var(--punk)",
            padding: "0px 4px", marginLeft: "auto",
            fontFamily: "'Share Tech Mono', monospace",
          }}>0.05 ETH</span>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ isMobile, isOpen, onClose, isCollapsed, onToggleCollapse }: Props) {
  const { pathname } = useLocation();
  const isAdmin     = useIsAdmin();
  const questsOpen  = pathname.startsWith("/quests");
  const stakingOpen = pathname.startsWith("/staking");
  const perpsOpen   = pathname.startsWith("/perps");

  if (isMobile && !isOpen) return null;

  const collapsed = !isMobile && !!isCollapsed;
  const width = collapsed ? 48 : 200;

  return (
    <>
      {isMobile && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 49,
          }}
        />
      )}

      <aside style={{
        width,
        minHeight: "100vh",
        background: "var(--bg-card)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: collapsed ? "0.75rem 0" : "0.75rem 0.6rem",
        position: "fixed",
        left: 0, top: 0, bottom: 0,
        zIndex: 50,
        overflowY: "auto",
        overflowX: "hidden",
        transition: "width 0.2s ease, padding 0.2s ease",
      }}>
        {/* Top accent line */}
        <div style={{
          height: 2,
          background: "linear-gradient(90deg, var(--accent), transparent)",
          marginBottom: "1.25rem",
          marginLeft: collapsed ? "0.5rem" : "0.25rem",
          marginRight: collapsed ? "0.5rem" : "0.25rem",
        }} />

        {/* Logo + collapse toggle */}
        <div style={{
          display: "flex", alignItems: "center",
          marginBottom: "1rem",
          padding: collapsed ? "0" : "0 0.25rem",
          justifyContent: collapsed ? "center" : "space-between",
          position: "relative",
        }}>
          {!collapsed && (
            <NavLink to="/" end onClick={onClose} style={{ display: "flex", alignItems: "center", textDecoration: "none", flex: 1 }}>
              <img
                src="https://i.ibb.co/gZdKMXtL/Jink-FI-logo-with-lightning-bolt-design.png"
                alt="JinkFi"
                style={{
                  width: 110, height: "auto", display: "block",
                  filter: "brightness(1.1) drop-shadow(0 0 6px rgba(212,175,55,0.3))",
                  mixBlendMode: "lighten",
                }}
              />
            </NavLink>
          )}

          {collapsed && (
            <NavLink to="/" end style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              <img
                src="https://i.ibb.co/gZdKMXtL/Jink-FI-logo-with-lightning-bolt-design.png"
                alt="JinkFi"
                style={{
                  width: 36, height: 36, objectFit: "contain",
                  filter: "brightness(1.1) drop-shadow(0 0 6px rgba(212,175,55,0.3))",
                  mixBlendMode: "lighten",
                }}
              />
            </NavLink>
          )}

          {isMobile ? (
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.25rem" }}>
              <X size={16} />
            </button>
          ) : (
            <button
              onClick={onToggleCollapse}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              style={{
                position: collapsed ? "relative" : "absolute",
                right: collapsed ? "auto" : "-12px",
                top: collapsed ? "auto" : "50%",
                transform: collapsed ? "none" : "translateY(-50%)",
                width: 24, height: 24,
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 51,
                transition: "all 0.12s",
                marginTop: collapsed ? "0.5rem" : 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            </button>
          )}
        </div>

        {/* Section label — hidden when collapsed */}
        {!collapsed && (
          <div style={{
            padding: "0 0.75rem", marginBottom: "0.4rem",
            fontSize: 10, fontWeight: 800, letterSpacing: "0.15em",
            color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace",
          }}>
            MARKETS
          </div>
        )}

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.1rem", flex: 1 }}>
          {NAV.map(({ to, icon: Icon, label, badge }) => (
            <div key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                onClick={onClose}
                title={collapsed ? label : undefined}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: collapsed ? 0 : "0.65rem",
                  padding: collapsed ? "0.45rem 0" : "0.4rem 0.6rem",
                  justifyContent: collapsed ? "center" : "flex-start",
                  textDecoration: "none",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 13,
                  letterSpacing: isActive ? "0.02em" : "0",
                  color: isActive ? "var(--accent)" : "var(--text-muted)",
                  background: isActive ? ACTIVE_BG : "transparent",
                  borderLeft: `3px solid ${isActive ? "var(--accent)" : "transparent"}`,
                  transition: "all 0.12s",
                })}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={collapsed ? 15 : 13} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.5 }} color={isActive ? "var(--accent)" : undefined} />
                    {!collapsed && (
                      <>
                        <span style={{ flex: 1 }}>{label}</span>
                        {badge && (
                          <span style={{
                            fontSize: 8, fontWeight: 800, letterSpacing: "0.1em",
                            color: isActive ? "var(--bg-deep)" : "var(--punk)",
                            background: isActive ? "var(--accent)" : "transparent",
                            border: `1px solid ${isActive ? "var(--accent)" : "var(--punk)"}`,
                            padding: "1px 4px",
                            fontFamily: "'Share Tech Mono', monospace",
                          }}>{badge}</span>
                        )}
                      </>
                    )}
                  </>
                )}
              </NavLink>

              {!collapsed && to === "/perps"   && perpsOpen   && <Submenu to="/perps/create"   label="Create Market" onClose={onClose} />}
              {!collapsed && to === "/staking" && stakingOpen  && <Submenu to="/staking/create" label="Create Pool"   onClose={onClose} />}
              {!collapsed && to === "/quests"  && questsOpen   && <Submenu to="/quests/create"  label="Create"        onClose={onClose} />}
            </div>
          ))}

          {/* Divider — only when admin section is visible */}
          {isAdmin && <div style={{ height: 1, background: "var(--border)", margin: "0.75rem 0.5rem" }} />}

          {/* Admin links — only shown to admin wallets */}
          {!collapsed && isAdmin && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem", marginBottom: "0.25rem" }}>
              {[
                { to: "/admin",         label: "Admin: Overview" },
                { to: "/admin/quests",  label: "Admin: Quests"   },
                { to: "/admin/staking", label: "Admin: Staking"  },
                { to: "/admin/perps",   label: "Admin: Perps"    },
              ].map(({ to, label }) => (
                <NavLink key={to} to={to} end={to === "/admin"} onClick={onClose}
                  style={({ isActive }) => ({
                    display: "flex", alignItems: "center", gap: "0.65rem",
                    padding: "0.45rem 0.75rem", textDecoration: "none",
                    fontSize: 12, fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--accent)" : "var(--text-muted)",
                    background: isActive ? ACTIVE_BG : "transparent",
                    borderLeft: `3px solid ${isActive ? "var(--accent)" : "transparent"}`,
                    letterSpacing: "0.04em",
                    fontFamily: "'Share Tech Mono', monospace",
                    transition: "all 0.12s",
                  })}
                >{label}</NavLink>
              ))}
            </div>
          )}

          {!collapsed && (
            <>
              {[
                { href: "https://docs.jinkfi.xyz/",      label: "Docs",     Icon: ExternalLink },
                { href: "https://twitter.com/jinkfi",  label: "Follow X", Icon: ExternalLink },
              ].map(({ href, label, Icon }) => (
                <a key={href} href={href} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.55rem 0.75rem", textDecoration: "none", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", borderLeft: "3px solid transparent", transition: "all 0.12s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                  <Icon size={14} style={{ opacity: 0.4, flexShrink: 0 }} />
                  {label}
                </a>
              ))}

              <a href="https://jink.fun" target="_blank" rel="noreferrer"
                style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.55rem 0.75rem", textDecoration: "none", fontSize: 13, fontWeight: 600, color: "var(--accent)", borderLeft: "3px solid transparent", transition: "all 0.12s" }}
              >
                <Rocket size={14} style={{ opacity: 0.7, flexShrink: 0 }} />
                Launchpad ↗
              </a>
            </>
          )}

          {collapsed && (
            <>
              <a href="https://docs.jinkfi.xyz/" target="_blank" rel="noreferrer" title="Docs"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0.6rem 0", color: "var(--text-muted)", transition: "color 0.12s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                <ExternalLink size={18} style={{ opacity: 0.4 }} />
              </a>
              <a href="https://jink.fun" target="_blank" rel="noreferrer" title="Launchpad"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0.6rem 0", color: "var(--accent)", transition: "color 0.12s" }}
              >
                <Rocket size={18} style={{ opacity: 0.7 }} />
              </a>
            </>
          )}
        </nav>

        {/* Bottom status — hidden when collapsed */}
        {!collapsed && (
          <div style={{ padding: "0.75rem 0.75rem 0.25rem", borderTop: "1px solid var(--border)", marginTop: "0.5rem" }}>
            <a href="http://jinklabs.xyz/" target="_blank" rel="noreferrer"
              style={{ display: "block", marginBottom: "0.65rem", textDecoration: "none" }}
            >
              <div style={{
                fontSize: 10, color: "var(--text-muted)",
                fontFamily: "'Share Tech Mono', monospace",
                letterSpacing: "0.08em",
              }}>
                Powered By{" "}
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>Jinklabs.xyz</span>
              </div>
            </a>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: 6, height: 6, background: "var(--accent)", boxShadow: "0 0 8px var(--accent-glow)", borderRadius: "50%", animation: "punkPulse 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 10, color: "var(--accent)", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.1em" }}>LIVE</span>
              <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: "auto", fontFamily: "'Share Tech Mono', monospace" }}>v3.0</span>
            </div>
          </div>
        )}

        {collapsed && (
          <div style={{ padding: "0.75rem 0", borderTop: "1px solid var(--border)", marginTop: "0.5rem", display: "flex", justifyContent: "center" }}>
            <div style={{ width: 6, height: 6, background: "var(--accent)", boxShadow: "0 0 8px var(--accent-glow)", borderRadius: "50%", animation: "punkPulse 2s ease-in-out infinite" }} />
          </div>
        )}
      </aside>
    </>
  );
}
