import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { useUI } from "../../context/UIContext";
import Ticker from "./Ticker";
import ChainSwitcher from "./ChainSwitcher";
import WalletButton from "./WalletButton";

const PAGE_TITLES: Record<string, string> = {
  "/swap":          "SWAP",
  "/pool":          "LIQUIDITY",
  "/perps":         "PERPETUALS",
  "/farm":          "YIELD FARM",
  "/locker":        "LOCKER",
  "/quests":        "QUESTS",
  "/quests/create": "CREATE",
  "/admin/quests":  "ADMIN",
  "/staking":        "STAKING",
  "/staking/create": "CREATE POOL",
  "/perps/create":   "CREATE MARKET",
  "/leaderboard":   "LEADERBOARD",
  "/bridge":        "BRIDGE",
  "/profile":       "PROFILE",
};

interface Props {
  isMobile?: boolean;
  onMenuClick?: () => void;
}

export default function Navbar({ isMobile, onMenuClick }: Props) {
  const { pathname } = useLocation();
  const { locale, toggleLocale } = useUI();

  const title = PAGE_TITLES[pathname] ?? (
    pathname.startsWith("/quests/") ? "QUEST" :
    pathname.startsWith("/staking/") ? "STAKING" :
    pathname.startsWith("/perps/") ? "PERPS" :
    "JINKFI"
  );

  const iconBtnStyle: React.CSSProperties = {
    background: "transparent",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
    cursor: "pointer",
    width: 32, height: 32,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.12s",
    flexShrink: 0,
  };

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40 }}>
      <nav style={{
        background: "rgba(0,21,32,0.97)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid var(--border)",
        padding: isMobile ? "0 0.75rem" : "0 1rem",
        display: "flex", alignItems: "center",
        height: 46, gap: "0.5rem",
        position: "relative",
      }}>
        {/* Bottom accent line */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, var(--accent) 0%, transparent 60%)",
          opacity: 0.4,
          pointerEvents: "none",
        }} />

        {/* Hamburger on mobile */}
        {isMobile && (
          <button
            onClick={onMenuClick}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.25rem", display: "flex", alignItems: "center" }}
          >
            <Menu size={20} />
          </button>
        )}

        {/* Page title — truncates on small screens */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "0.5rem", overflow: "hidden" }}>
          <div style={{ width: 2, height: 16, flexShrink: 0, background: "var(--accent)", boxShadow: "0 0 8px var(--accent-glow)" }} />
          <span style={{
            fontWeight: 900, fontSize: isMobile ? 13 : 16,
            color: "var(--text)",
            letterSpacing: isMobile ? "0.06em" : "0.12em",
            fontFamily: "'Rajdhani', 'Inter', sans-serif",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {title}
          </span>
        </div>

        {/* Right controls — never wrap, never shrink below their content */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0 }}>

          {/* Language toggle — hidden on narrow mobile */}
          {!isMobile && (
            <button
              onClick={toggleLocale}
              style={iconBtnStyle}
              title={locale === "en" ? "Switch to Chinese" : "切换到英文"}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <span style={{ fontSize: 10, fontWeight: 800, fontFamily: "'Share Tech Mono', monospace", letterSpacing: 0 }}>
                {locale === "en" ? "中" : "EN"}
              </span>
            </button>
          )}

          <ChainSwitcher />
          <WalletButton />
        </div>
      </nav>
      {!isMobile && <Ticker />}
    </header>
  );
}
