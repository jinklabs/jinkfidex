import { useState, useEffect } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import Navbar from "./components/shared/Navbar";
import Sidebar from "./components/shared/Sidebar";
import BottomNav from "./components/shared/BottomNav";
import BackgroundRays from "./components/shared/BackgroundRays";
import SwapPage from "./pages/SwapPage";
import PoolPage from "./pages/PoolPage";
import FarmPage from "./pages/FarmPage";
import LockerPage from "./pages/LockerPage";
import QuestsPage from "./pages/QuestsPage";
import QuestDetailPage from "./pages/QuestDetailPage";
import PerpsPage from "./pages/PerpsPage";
import StakingPage from "./pages/StakingPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import BridgePage from "./pages/BridgePage";
import ProfilePage from "./pages/ProfilePage";
import CreateQuestPage from "./pages/CreateQuestPage";
import AdminQuestsPage from "./pages/AdminQuestsPage";
import AdminStakingPage from "./pages/AdminStakingPage";
import AdminPerpsPage from "./pages/AdminPerpsPage";
import AdminOverviewPage from "./pages/AdminOverviewPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import LandingPage from "./pages/LandingPage";
import CreateStakingPage from "./pages/CreateStakingPage";
import CreatePerpsPage from "./pages/CreatePerpsPage";
import { PriceFeedProvider } from "./context/PriceFeedContext";
import { UIProvider } from "./context/UIContext";
import { useIsMobile } from "./hooks/useIsMobile";
import { PageErrorBoundary } from "./components/shared/ErrorBoundary";
import { useIsAdmin } from "./hooks/useIsAdmin";

// ── Admin guard — blocks non-admin wallets ────────────────────────────────────

function AdminGuard({ children }: { children: React.ReactNode }) {
  const isAdmin = useIsAdmin();
  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 480, margin: "8rem auto", textAlign: "center", padding: "0 1.5rem" }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.14em" }}>
          ACCESS DENIED — ADMIN WALLET REQUIRED
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

// ── App shell (sidebar + navbar) wrapping all non-landing routes ──────────────

function AppLayout() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarWidth = isMobile ? 0 : sidebarCollapsed ? 48 : 200;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-deep)" }}>
      {!isMobile && (
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        />
      )}
      {isMobile && (
        <Sidebar
          isMobile
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div style={{
        marginLeft: sidebarWidth,
        flex: 1,
        position: "relative",
        minWidth: 0,
        paddingBottom: isMobile ? 64 : 0,
        transition: "margin-left 0.2s ease",
      }}>
        <BackgroundRays />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Navbar isMobile={isMobile} onMenuClick={() => setSidebarOpen(true)} />
          <Outlet />
        </div>
      </div>

      {isMobile && <BottomNav />}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <UIProvider>
    <PriceFeedProvider>
      <ScrollToTop />
      <Routes>
        {/* Standalone landing — no sidebar or navbar */}
        <Route path="/" element={<PageErrorBoundary><LandingPage /></PageErrorBoundary>} />

        {/* App shell wraps all other routes */}
        <Route element={<AppLayout />}>
          <Route path="/swap"           element={<PageErrorBoundary><SwapPage /></PageErrorBoundary>} />
          <Route path="/pool"           element={<PageErrorBoundary><PoolPage /></PageErrorBoundary>} />
          <Route path="/farm"           element={<PageErrorBoundary><FarmPage /></PageErrorBoundary>} />
          <Route path="/locker"         element={<PageErrorBoundary><LockerPage /></PageErrorBoundary>} />
          <Route path="/bridge"         element={<PageErrorBoundary><BridgePage /></PageErrorBoundary>} />
          <Route path="/analytics"      element={<PageErrorBoundary><AnalyticsPage /></PageErrorBoundary>} />
          <Route path="/leaderboard"    element={<PageErrorBoundary><LeaderboardPage /></PageErrorBoundary>} />
          <Route path="/profile"        element={<PageErrorBoundary><ProfilePage /></PageErrorBoundary>} />
          {/* Quests */}
          <Route path="/quests"         element={<PageErrorBoundary><QuestsPage /></PageErrorBoundary>} />
          <Route path="/quests/create"  element={<PageErrorBoundary><CreateQuestPage /></PageErrorBoundary>} />
          <Route path="/quests/:id"     element={<PageErrorBoundary><QuestDetailPage /></PageErrorBoundary>} />
          {/* Perps */}
          <Route path="/perps"          element={<PageErrorBoundary><PerpsPage /></PageErrorBoundary>} />
          <Route path="/perps/create"   element={<PageErrorBoundary><CreatePerpsPage /></PageErrorBoundary>} />
          {/* Staking */}
          <Route path="/staking"        element={<PageErrorBoundary><StakingPage /></PageErrorBoundary>} />
          <Route path="/staking/create" element={<PageErrorBoundary><CreateStakingPage /></PageErrorBoundary>} />
          {/* Admin — gated to admin wallets only */}
          <Route path="/admin"          element={<PageErrorBoundary><AdminGuard><AdminOverviewPage /></AdminGuard></PageErrorBoundary>} />
          <Route path="/admin/quests"   element={<PageErrorBoundary><AdminGuard><AdminQuestsPage /></AdminGuard></PageErrorBoundary>} />
          <Route path="/admin/staking"  element={<PageErrorBoundary><AdminGuard><AdminStakingPage /></AdminGuard></PageErrorBoundary>} />
          <Route path="/admin/perps"    element={<PageErrorBoundary><AdminGuard><AdminPerpsPage /></AdminGuard></PageErrorBoundary>} />
        </Route>
      </Routes>
    </PriceFeedProvider>
    </UIProvider>
  );
}
