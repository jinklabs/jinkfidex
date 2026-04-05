import { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { parseUnits } from "viem";
import {
  Lock, Droplets, Search, Plus, X, Shield, Clock,
  ChevronDown, ExternalLink, AlertCircle, CheckCircle2,
} from "lucide-react";
import { type Lock as LockType } from "../api/client";
import { useLocker } from "../hooks/useLocker";
import LockStatusBadge from "../components/locker/LockStatusBadge";
import LockActionModal from "../components/locker/LockActionModal";

type Tab = "token" | "lp" | "mine";
type LockMode = "token" | "lp";

// ── helpers ───────────────────────────────────────────────────────────────────

function countdown(unlockDate: string) {
  const ms = new Date(unlockDate).getTime() - Date.now();
  if (ms <= 0) return "Unlocked";
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  if (d > 365) return `${Math.floor(d / 365)}y ${d % 365}d`;
  if (d > 0) return `${d}d ${h}h`;
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function lockProgress(lock: LockType): number {
  // estimate creation as 30 days before unlock for demo (real: use createdAt)
  const unlockMs = new Date(lock.unlockDate).getTime();
  const nowMs = Date.now();
  const created = unlockMs - 30 * 86400000; // fallback
  const total = unlockMs - created;
  const elapsed = nowMs - created;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

// ── styles ────────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.55rem 0.85rem",
  background: "var(--bg-input)", border: "1px solid var(--border)",
  color: "var(--text)", fontSize: 13, outline: "none", boxSizing: "border-box",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 800,
  letterSpacing: "0.12em", color: "var(--text-muted)",
  marginBottom: "0.35rem", fontFamily: "'Share Tech Mono', monospace",
};

const btnPrimary: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "0.4rem",
  padding: "0.55rem 1.25rem",
  background: "var(--accent)", border: "none",
  color: "#fff", fontWeight: 800, fontSize: 12,
  letterSpacing: "0.1em", cursor: "pointer",
  fontFamily: "'Share Tech Mono', monospace",
  whiteSpace: "nowrap",
};

const btnGhost: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "0.4rem",
  padding: "0.4rem 0.9rem",
  background: "transparent", border: "1px solid var(--border)",
  color: "var(--text-muted)", fontWeight: 700, fontSize: 11,
  letterSpacing: "0.08em", cursor: "pointer",
  fontFamily: "'Share Tech Mono', monospace",
};


// ── main component ────────────────────────────────────────────────────────────

export default function LockerPage() {
  const [tab, setTab]           = useState<Tab>("lp");
  const [search, setSearch]     = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState<LockMode>("lp");
  const [selectedLock, setSelectedLock] = useState<LockType | null>(null);
  const { address, isConnected } = useAccount();

  const locker = useLocker();

  const myLocks = locker.myLocks as unknown as LockType[];
  const myLoading = false;

  const allLocks = [...locker.exploreTokenLocks, ...locker.exploreLpLocks] as unknown as LockType[];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allLocks.filter(l => {
      const matchTab = tab === "lp" ? l.lockType === "lp" : tab === "token" ? l.lockType === "token" : true;
      const matchSearch = !q ||
        l.tokenSymbol?.toLowerCase().includes(q) ||
        l.token0Symbol?.toLowerCase().includes(q) ||
        l.token1Symbol?.toLowerCase().includes(q) ||
        l.tokenAddress.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [tab, search, allLocks]);

  const stats = useMemo(() => ({
    total:  locker.tokenCount + locker.lpCount,
    active: allLocks.filter(l => !l.withdrawn && new Date(l.unlockDate) > new Date()).length,
    lp:     locker.lpCount,
    token:  locker.tokenCount,
  }), [locker.tokenCount, locker.lpCount, allLocks]);

  function openCreate(mode: LockMode) { setCreateMode(mode); setShowCreate(true); }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem" }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.3rem" }}>
            <div style={{ width: 3, height: 24, background: "var(--accent)" }} />
            <h1 style={{ fontWeight: 900, fontSize: 22, letterSpacing: "0.08em", fontFamily: "'Rajdhani', sans-serif" }}>
              VAULT LOCKER
            </h1>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "var(--bg-deep)", background: "var(--accent)", padding: "2px 6px", fontFamily: "'Share Tech Mono', monospace" }}>
              NON-CUSTODIAL
            </span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", paddingLeft: "0.9rem" }}>
            Time-lock LP tokens &amp; project tokens · Signal commitment · Build trust
          </p>
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
          <button style={btnGhost} onClick={() => openCreate("lp")}>
            <Droplets size={12} /> LOCK LP
          </button>
          <button style={btnPrimary} onClick={() => openCreate("token")}>
            <Plus size={12} /> LOCK TOKEN
          </button>
        </div>
      </div>

      {/* ── Stats strip ────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {[
          { label: "TOTAL LOCKS",  value: stats.total,  icon: Shield  },
          { label: "ACTIVE LOCKS", value: stats.active, icon: Lock    },
          { label: "LP LOCKS",     value: stats.lp,     icon: Droplets},
          { label: "TOKEN LOCKS",  value: stats.token,  icon: Clock   },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            padding: "0.85rem 1rem",
            display: "flex", alignItems: "center", gap: "0.75rem",
          }}>
            <div style={{ width: 32, height: 32, background: "var(--bg-input)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={14} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1, color: "var(--text)", fontFamily: "'Rajdhani', sans-serif" }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab bar + search ────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {/* Tabs */}
        <div style={{ display: "flex", border: "1px solid var(--border)", overflow: "hidden" }}>
          {([
            ["lp",    "LP LOCKS",    Droplets],
            ["token", "TOKEN LOCKS", Lock    ],
            ["mine",  "MY LOCKS",    Shield  ],
          ] as [Tab, string, typeof Lock][]).map(([t, label, Icon]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              padding: "0.5rem 1rem",
              background: tab === t ? "var(--accent)" : "transparent",
              border: "none",
              borderRight: t !== "mine" ? "1px solid var(--border)" : "none",
              color: tab === t ? "#fff" : "var(--text-muted)",
              fontWeight: 800, fontSize: 11, cursor: "pointer",
              letterSpacing: "0.1em", fontFamily: "'Share Tech Mono', monospace",
              transition: "all 0.12s",
            }}>
              <Icon size={11} />
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        {tab !== "mine" && (
          <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            <input
              style={{ ...inputStyle, paddingLeft: "2rem" }}
              placeholder="Search token, pair, or address…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}

        <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", flexShrink: 0 }}>
          {tab !== "mine" ? `${filtered.length} locks` : `${myLocks?.length ?? 0} locks`}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {tab === "mine" ? (
        <MyLocksPanel
          locks={myLocks ?? []}
          isLoading={myLoading}
          isConnected={isConnected}
          onManage={setSelectedLock}
          onCreateLP={() => openCreate("lp")}
          onCreateToken={() => openCreate("token")}
        />
      ) : (
        <ExploreTable locks={filtered} onManage={setSelectedLock} />
      )}

      {/* ── Create lock drawer ──────────────────────────────────────────── */}
      {showCreate && (
        <CreateLockDrawer
          mode={createMode}
          onModeChange={setCreateMode}
          onClose={() => setShowCreate(false)}
          address={address}
          isConnected={isConnected}
          onCreated={() => locker.refetch()}
          onCreateLock={locker.createLock}
        />
      )}

      {/* ── Manage modal ────────────────────────────────────────────────── */}
      {selectedLock && (
        <LockActionModal
          lock={selectedLock}
          onClose={() => setSelectedLock(null)}
          onUpdated={() => locker.refetch()}
        />
      )}
    </div>
  );
}

// ── Explore table ─────────────────────────────────────────────────────────────

function ExploreTable({ locks, onManage }: { locks: LockType[]; onManage: (l: LockType) => void }) {
  const [sort, setSort] = useState<"amount" | "unlock" | "progress">("unlock");

  const sorted = useMemo(() => {
    return [...locks].sort((a, b) => {
      if (sort === "amount")   return parseFloat(b.amount) - parseFloat(a.amount);
      if (sort === "unlock")   return new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime();
      if (sort === "progress") return lockProgress(b) - lockProgress(a);
      return 0;
    });
  }, [locks, sort]);

  if (!locks.length) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <Lock size={28} style={{ opacity: 0.25, marginBottom: "0.75rem" }} />
        <div style={{ fontSize: 13 }}>No locks found</div>
      </div>
    );
  }

  const SortBtn = ({ field, label }: { field: typeof sort; label: string }) => (
    <button onClick={() => setSort(field)} style={{
      background: "none", border: "none", cursor: "pointer", padding: 0,
      display: "flex", alignItems: "center", gap: "0.25rem",
      color: sort === field ? "var(--accent)" : "var(--text-muted)",
      fontWeight: 800, fontSize: 10, letterSpacing: "0.12em",
      fontFamily: "'Share Tech Mono', monospace",
    }}>
      {label} {sort === field && <ChevronDown size={10} />}
    </button>
  );

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", overflow: "hidden" }}>
      {/* Table header */}
      <div style={{
        display: "grid", gridTemplateColumns: "2fr 1.5fr 1.2fr 1.2fr 1.5fr 80px",
        padding: "0.65rem 1rem", borderBottom: "1px solid var(--border)",
        background: "var(--bg-input)",
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>TOKEN / PAIR</div>
        <SortBtn field="amount"   label="LOCKED AMT" />
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>STATUS</div>
        <SortBtn field="unlock"   label="UNLOCKS IN" />
        <SortBtn field="progress" label="PROGRESS" />
        <div />
      </div>

      {/* Rows */}
      {sorted.map((lock, i) => (
        <LockRow key={lock.id} lock={lock} onManage={onManage} isLast={i === sorted.length - 1} />
      ))}
    </div>
  );
}

function LockRow({ lock, onManage, isLast }: { lock: LockType; onManage: (l: LockType) => void; isLast: boolean }) {
  const pct       = lockProgress(lock);
  const isUnlocked = new Date(lock.unlockDate) <= new Date();
  const name = lock.lockType === "lp"
    ? `${lock.token0Symbol ?? "?"}/${lock.token1Symbol ?? "?"}`
    : (lock.tokenSymbol ?? shortAddr(lock.tokenAddress));

  return (
    <div
      style={{
        display: "grid", gridTemplateColumns: "2fr 1.5fr 1.2fr 1.2fr 1.5fr 80px",
        alignItems: "center", padding: "0.9rem 1rem",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        transition: "background 0.1s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-card2)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
    >
      {/* Name */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
        <div style={{ width: 32, height: 32, background: "var(--bg-input)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {lock.lockType === "lp" ? <Droplets size={14} color="var(--punk)" /> : <Lock size={14} color="var(--accent)" />}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{name}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
            {shortAddr(lock.tokenAddress)}
            <a href={`https://etherscan.io/address/${lock.tokenAddress}`} target="_blank" rel="noreferrer" style={{ marginLeft: "0.3rem", color: "var(--text-muted)", opacity: 0.5 }}>
              <ExternalLink size={9} style={{ display: "inline" }} />
            </a>
          </div>
        </div>
      </div>

      {/* Amount */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "'Share Tech Mono', monospace" }}>
          {parseFloat(lock.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
          {lock.lockType === "lp" ? "LP tokens" : lock.tokenSymbol}
        </div>
      </div>

      {/* Status */}
      <div>
        <LockStatusBadge unlockDate={lock.unlockDate} withdrawn={lock.withdrawn} />
      </div>

      {/* Countdown */}
      <div style={{ fontWeight: 700, fontSize: 13, color: isUnlocked ? "#4ade80" : "var(--text)", fontFamily: "'Share Tech Mono', monospace" }}>
        {countdown(lock.unlockDate)}
        <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 400, marginTop: 2 }}>
          {new Date(lock.unlockDate).toLocaleDateString()}
        </div>
      </div>

      {/* Progress */}
      <div style={{ paddingRight: "0.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
          <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>ELAPSED</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: "var(--accent)", fontFamily: "'Share Tech Mono', monospace" }}>{Math.round(pct)}%</span>
        </div>
        <div style={{ height: 3, background: "var(--bg-input)", border: "1px solid var(--border)", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${pct}%`,
            background: isUnlocked
              ? "linear-gradient(90deg, #4ade80, #22d3ee)"
              : `linear-gradient(90deg, var(--accent), var(--punk))`,
            transition: "width 0.5s ease",
          }} />
        </div>
      </div>

      {/* Action */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => onManage(lock)}
          style={{ ...btnGhost, padding: "0.3rem 0.7rem", fontSize: 10 }}
        >
          MANAGE
        </button>
      </div>
    </div>
  );
}

// ── My Locks panel ────────────────────────────────────────────────────────────

function MyLocksPanel({ locks, isLoading, isConnected, onManage, onCreateLP, onCreateToken }: {
  locks: LockType[]; isLoading: boolean; isConnected: boolean;
  onManage: (l: LockType) => void;
  onCreateLP: () => void; onCreateToken: () => void;
}) {
  if (!isConnected) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 1rem", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <Shield size={36} style={{ opacity: 0.2, marginBottom: "1rem" }} />
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: "0.5rem" }}>Connect your wallet</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>View and manage your locks</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
        {[1, 2, 3].map(i => <div key={i} style={{ height: 140, background: "var(--bg-card)", border: "1px solid var(--border)", animation: "pulse 1.5s infinite" }} />)}
      </div>
    );
  }

  if (!locks.length) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <Lock size={32} style={{ opacity: 0.2, marginBottom: "0.75rem" }} />
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: "0.5rem" }}>No locks yet</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: "1.5rem" }}>Create your first lock to build trust</div>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button style={btnGhost} onClick={onCreateLP}><Droplets size={12} /> LOCK LP</button>
          <button style={btnPrimary} onClick={onCreateToken}><Plus size={12} /> LOCK TOKEN</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "0.75rem" }}>
      {locks.map(lock => <MyLockCard key={lock.id} lock={lock} onManage={onManage} />)}
    </div>
  );
}

function MyLockCard({ lock, onManage }: { lock: LockType; onManage: (l: LockType) => void }) {
  const pct        = lockProgress(lock);
  const isUnlocked = new Date(lock.unlockDate) <= new Date();
  const name = lock.lockType === "lp"
    ? `${lock.token0Symbol ?? "?"}/${lock.token1Symbol ?? "?"}`
    : (lock.tokenSymbol ?? shortAddr(lock.tokenAddress));

  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      padding: "1rem 1.1rem", position: "relative", overflow: "hidden",
    }}>
      {/* Top accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: isUnlocked ? "#4ade80" : "var(--accent)" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: 34, height: 34, background: "var(--bg-input)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {lock.lockType === "lp" ? <Droplets size={15} color="var(--punk)" /> : <Lock size={15} color="var(--accent)" />}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>{name}</div>
            <div style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", marginTop: 1 }}>
              {lock.lockType === "lp" ? "LP TOKEN" : "TOKEN"} · {shortAddr(lock.tokenAddress)}
            </div>
          </div>
        </div>
        <LockStatusBadge unlockDate={lock.unlockDate} withdrawn={lock.withdrawn} />
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
        <div>
          <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em", fontFamily: "'Share Tech Mono', monospace" }}>AMOUNT</div>
          <div style={{ fontWeight: 700, fontSize: 14, marginTop: 2, fontFamily: "'Share Tech Mono', monospace" }}>
            {parseFloat(lock.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em", fontFamily: "'Share Tech Mono', monospace" }}>UNLOCKS IN</div>
          <div style={{ fontWeight: 700, fontSize: 14, marginTop: 2, color: isUnlocked ? "#4ade80" : "var(--text)" }}>
            {countdown(lock.unlockDate)}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: "0.85rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
          <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>LOCK PROGRESS</span>
          <span style={{ fontSize: 9, fontWeight: 800, color: "var(--accent)", fontFamily: "'Share Tech Mono', monospace" }}>{Math.round(pct)}%</span>
        </div>
        <div style={{ height: 4, background: "var(--bg-input)", border: "1px solid var(--border)", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: isUnlocked ? "#4ade80" : "linear-gradient(90deg, var(--accent), var(--punk))",
            transition: "width 0.6s ease",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.2rem", fontSize: 8, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
          <span>START</span>
          <span>{new Date(lock.unlockDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Actions */}
      {!lock.withdrawn && (
        <button onClick={() => onManage(lock)} style={{ ...btnGhost, width: "100%", justifyContent: "center", padding: "0.45rem" }}>
          MANAGE LOCK
        </button>
      )}
    </div>
  );
}

// ── Create lock drawer (slides in from right) ─────────────────────────────────

function CreateLockDrawer({ mode, onModeChange, onClose, address: _address, isConnected, onCreated, onCreateLock }: {
  mode: LockMode; onModeChange: (m: LockMode) => void;
  onClose: () => void; address?: string; isConnected: boolean;
  onCreated: () => void;
  onCreateLock: (type: "token" | "lp", tokenAddress: `0x${string}`, rawAmount: bigint, durationSecs: number) => Promise<`0x${string}`>;
}) {
  const [form, setForm] = useState({ tokenAddress: "", amount: "", unlockDate: "" });
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleCreate() {
    if (!form.tokenAddress || !form.amount || !form.unlockDate) return;
    const durationSecs = Math.max(60, Math.floor((new Date(form.unlockDate).getTime() - Date.now()) / 1000));
    setIsPending(true);
    setError(null);
    try {
      const hash = await onCreateLock(
        mode,
        form.tokenAddress as `0x${string}`,
        parseUnits(form.amount, 18),
        durationSecs,
      );
      setTxHash(hash);
      setSuccess(true);
      onCreated();
      setTimeout(() => { setSuccess(false); setTxHash(null); setForm({ tokenAddress: "", amount: "", unlockDate: "" }); }, 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Transaction failed");
    } finally {
      setIsPending(false);
    }
  }

  // Preset durations
  const PRESETS = [
    { label: "7d",  days: 7   },
    { label: "30d", days: 30  },
    { label: "3mo", days: 90  },
    { label: "6mo", days: 180 },
    { label: "1yr", days: 365 },
  ];

  function applyPreset(days: number) {
    const d = new Date(Date.now() + days * 86400000);
    d.setSeconds(0, 0);
    set("unlockDate", d.toISOString().slice(0, 16));
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 200 }} />

      {/* Drawer */}
      <div style={{
        position: "fixed", right: 0, top: 0, bottom: 0,
        width: 420, maxWidth: "100vw",
        background: "var(--bg-card)",
        borderLeft: "1px solid var(--border)",
        zIndex: 201,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Top accent */}
        <div style={{ height: 2, background: "linear-gradient(90deg, var(--accent), transparent)", flexShrink: 0 }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 1.25rem", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: "0.1em", fontFamily: "'Share Tech Mono', monospace" }}>NEW LOCK</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.25rem", display: "flex" }}>
            <X size={16} />
          </button>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          {([["token", "TOKEN LOCK", Lock], ["lp", "LP LOCK", Droplets]] as [LockMode, string, typeof Lock][]).map(([m, label, Icon]) => (
            <button key={m} onClick={() => onModeChange(m)} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
              padding: "0.7rem",
              background: mode === m ? "var(--bg-input)" : "transparent",
              border: "none", borderBottom: `2px solid ${mode === m ? "var(--accent)" : "transparent"}`,
              color: mode === m ? "var(--accent)" : "var(--text-muted)",
              fontWeight: 800, fontSize: 11, cursor: "pointer",
              letterSpacing: "0.1em", fontFamily: "'Share Tech Mono', monospace",
              transition: "all 0.12s",
            }}>
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
          {success ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: "0.75rem", color: "#4ade80" }}>
              <CheckCircle2 size={40} />
              <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: "0.1em", fontFamily: "'Share Tech Mono', monospace" }}>LOCK CREATED!</div>
              {txHash && (
                <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer"
                  style={{ fontSize: 11, color: "#4ade80", textDecoration: "underline", fontFamily: "'Share Tech Mono', monospace" }}>
                  View on Etherscan
                </a>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              {/* Info box */}
              <div style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderLeft: "3px solid var(--accent)", padding: "0.75rem 0.9rem", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                {mode === "lp"
                  ? "Lock LP tokens to prove liquidity won't be removed. Builds community confidence."
                  : "Lock project tokens to demonstrate long-term commitment. Signals vesting intent."
                }
              </div>

              {/* Token address */}
              <div>
                <label style={labelStyle}>{mode === "lp" ? "LP TOKEN ADDRESS *" : "TOKEN ADDRESS *"}</label>
                <input style={inputStyle} placeholder="0x..." value={form.tokenAddress} onChange={e => set("tokenAddress", e.target.value)} />
              </div>

              {/* Amount */}
              <div>
                <label style={labelStyle}>AMOUNT TO LOCK *</label>
                <input style={inputStyle} type="number" placeholder="0.0" value={form.amount} onChange={e => set("amount", e.target.value)} />
              </div>

              {/* Unlock date + presets */}
              <div>
                <label style={labelStyle}>UNLOCK DATE *</label>
                <div style={{ display: "flex", gap: "0.35rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                  {PRESETS.map(p => (
                    <button key={p.label} onClick={() => applyPreset(p.days)} style={{
                      padding: "0.25rem 0.6rem", fontSize: 10, fontWeight: 800,
                      background: "var(--bg-input)", border: "1px solid var(--border)",
                      color: "var(--text-muted)", cursor: "pointer",
                      fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.06em",
                      transition: "all 0.1s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <input style={inputStyle} type="datetime-local" value={form.unlockDate} onChange={e => set("unlockDate", e.target.value)} />
              </div>

              {/* Warning */}
              <div style={{ display: "flex", gap: "0.5rem", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", padding: "0.7rem 0.85rem", fontSize: 11, color: "#fbbf24", lineHeight: 1.5 }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                Locks are irreversible until the unlock date. Verify all details before submitting.
              </div>

              {error && (
                <div style={{ fontSize: 12, color: "#f87171", display: "flex", gap: "0.4rem", alignItems: "flex-start" }}>
                  <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
            <button
              onClick={handleCreate}
              disabled={!isConnected || isPending || !form.tokenAddress || !form.amount || !form.unlockDate}
              style={{
                ...btnPrimary, width: "100%", justifyContent: "center",
                padding: "0.8rem", fontSize: 13,
                opacity: (!isConnected || isPending || !form.tokenAddress || !form.amount || !form.unlockDate) ? 0.45 : 1,
              }}
            >
              <Lock size={13} />
              {isPending ? "WAITING FOR WALLET..." : !isConnected ? "CONNECT WALLET" : `CREATE ${mode.toUpperCase()} LOCK`}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
