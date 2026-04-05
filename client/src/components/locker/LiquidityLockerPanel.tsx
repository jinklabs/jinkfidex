import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount, useChainId } from "wagmi";
import { Droplets, Lock } from "lucide-react";
import { lockApi, type Lock as LockType } from "../../api/client";
import LockStatusBadge from "./LockStatusBadge";
import LockActionModal from "./LockActionModal";

export default function LiquidityLockerPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const queryClient = useQueryClient();

  const { data: locks, isLoading } = useQuery({
    queryKey: ["locks", "lp", address],
    queryFn: () => lockApi.list({ owner: address, type: "lp" }),
    enabled: !!address,
    staleTime: 30_000,
  });

  const [selectedLock, setSelectedLock] = useState<LockType | null>(null);
  const [form, setForm] = useState({ tokenAddress: "", amount: "", unlockDate: "" });
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    try {
      await lockApi.create({ ...form, lockType: "lp", owner: address!, chainId });
      queryClient.invalidateQueries({ queryKey: ["locks"] });
      setForm({ tokenAddress: "", amount: "", unlockDate: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create lock");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {[
          { label: "Total Locks", value: locks?.length ?? 0 },
          { label: "Active Locks", value: locks?.filter(l => !l.withdrawn && new Date(l.unlockDate) > new Date()).length ?? 0 },
          { label: "Unlocked", value: locks?.filter(l => !l.withdrawn && new Date(l.unlockDate) <= new Date()).length ?? 0 },
        ].map(stat => (
          <div key={stat.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "1rem 1.25rem" }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: "0.3rem" }}>{stat.label}</div>
            <div style={{ fontWeight: 700, fontSize: 22 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Create Form */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
            <Lock size={18} color="var(--accent)" />
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>Lock LP Tokens</h3>
          </div>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <Field label="LP Token Address" placeholder="0x..." value={form.tokenAddress} onChange={v => setForm(f => ({ ...f, tokenAddress: v }))} />
            <Field label="LP Amount" placeholder="1000" type="number" value={form.amount} onChange={v => setForm(f => ({ ...f, amount: v }))} />
            <div>
              <label style={{ display: "block", fontSize: 13, color: "var(--text-muted)", marginBottom: "0.35rem" }}>Unlock Date</label>
              <input type="datetime-local" value={form.unlockDate} onChange={e => setForm(f => ({ ...f, unlockDate: e.target.value }))} style={inputStyle} />
            </div>
            {error && <div style={{ fontSize: 13, color: "#f87171" }}>{error}</div>}
            <button
              type="submit"
              disabled={!isConnected || isPending || !form.tokenAddress || !form.amount || !form.unlockDate}
              style={{ padding: "0.85rem", borderRadius: 12, border: "none", background: "linear-gradient(135deg, var(--accent), #009e78)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
            >
              {isPending ? "Locking..." : "Lock LP Tokens"}
            </button>
          </form>
        </div>

        {/* LP Locks cards */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
            <Droplets size={18} color="var(--accent)" />
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>My LP Locks</h3>
          </div>
          {!isConnected ? (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem", fontSize: 14, background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)" }}>Connect wallet to view LP locks</div>
          ) : isLoading ? (
            <div style={{ color: "var(--text-muted)", padding: "2rem", textAlign: "center" }}>Loading...</div>
          ) : !locks?.length ? (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem", fontSize: 14, background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)" }}>No LP locks yet</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {locks.map(lock => <LPLockCard key={lock.id} lock={lock} onManage={() => setSelectedLock(lock)} />)}
            </div>
          )}
        </div>
      </div>

      {selectedLock && (
        <LockActionModal lock={selectedLock} onClose={() => setSelectedLock(null)} onUpdated={() => queryClient.invalidateQueries({ queryKey: ["locks"] })} />
      )}
    </div>
  );
}

function LPLockCard({ lock, onManage }: { lock: LockType; onManage: () => void }) {
  const daysLeft = Math.max(0, Math.ceil((new Date(lock.unlockDate).getTime() - Date.now()) / 86400000));

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "1rem 1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{lock.token0Symbol ?? "?"}/{lock.token1Symbol ?? "?"}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{lock.tokenAddress.slice(0, 8)}…{lock.tokenAddress.slice(-6)}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <LockStatusBadge unlockDate={lock.unlockDate} withdrawn={lock.withdrawn} />
          {!lock.withdrawn && (
            <button onClick={onManage} style={{ background: "rgba(0,200,150,0.15)", border: "1px solid rgba(0,200,150,0.3)", color: "var(--accent)", borderRadius: 6, padding: "3px 10px", fontSize: 12, cursor: "pointer" }}>Manage</button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", fontSize: 12 }}>
        <div><span style={{ color: "var(--text-muted)" }}>Amount</span><div style={{ fontWeight: 600, marginTop: 2 }}>{parseFloat(lock.amount).toFixed(4)}</div></div>
        <div><span style={{ color: "var(--text-muted)" }}>Unlock</span><div style={{ fontWeight: 600, marginTop: 2 }}>{new Date(lock.unlockDate).toLocaleDateString()}</div></div>
        <div><span style={{ color: "var(--text-muted)" }}>Days Left</span><div style={{ fontWeight: 600, marginTop: 2, color: daysLeft === 0 ? "#4ade80" : daysLeft < 7 ? "#f97316" : "var(--text)" }}>{daysLeft === 0 ? "Now" : `${daysLeft}d`}</div></div>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: "0.75rem" }}>
        <div style={{ height: 4, background: "var(--bg-input)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg, var(--accent), #009e78)", borderRadius: 2, width: daysLeft === 0 ? "100%" : "30%" }} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange, type = "text" }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, color: "var(--text-muted)", marginBottom: "0.35rem" }}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} style={inputStyle} />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 10,
  padding: "0.6rem 0.85rem", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box",
};
