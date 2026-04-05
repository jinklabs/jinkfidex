import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount, useChainId } from "wagmi";
import { Shield, Lock } from "lucide-react";
import { lockApi, type Lock as LockType } from "../../api/client";
import LockStatusBadge from "./LockStatusBadge";
import LockActionModal from "./LockActionModal";

export default function TokenLockerPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const queryClient = useQueryClient();

  const { data: locks, isLoading } = useQuery({
    queryKey: ["locks", "token", address],
    queryFn: () => lockApi.list({ owner: address, type: "token" }),
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
      await lockApi.create({ ...form, lockType: "token", owner: address!, chainId });
      queryClient.invalidateQueries({ queryKey: ["locks"] });
      setForm({ tokenAddress: "", amount: "", unlockDate: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create lock");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start" }}>
      {/* Create Form */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
          <Lock size={18} color="var(--accent)" />
          <h3 style={{ fontWeight: 700, fontSize: 16 }}>Lock Tokens</h3>
        </div>

        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <FormField
            label="Token Address"
            placeholder="0x..."
            value={form.tokenAddress}
            onChange={v => setForm(f => ({ ...f, tokenAddress: v }))}
          />
          <FormField
            label="Amount"
            placeholder="100000"
            type="number"
            value={form.amount}
            onChange={v => setForm(f => ({ ...f, amount: v }))}
          />
          <div>
            <label style={{ display: "block", fontSize: 13, color: "var(--text-muted)", marginBottom: "0.35rem" }}>Unlock Date</label>
            <input
              type="datetime-local"
              value={form.unlockDate}
              onChange={e => setForm(f => ({ ...f, unlockDate: e.target.value }))}
              style={inputStyle}
            />
          </div>

          {error && <div style={{ fontSize: 13, color: "#f87171" }}>{error}</div>}

          <button
            type="submit"
            disabled={!isConnected || isPending || !form.tokenAddress || !form.amount || !form.unlockDate}
            style={{ padding: "0.85rem", borderRadius: 12, border: "none", background: "linear-gradient(135deg, var(--accent), #009e78)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: isPending ? 0.7 : 1 }}
          >
            {isPending ? "Locking..." : isConnected ? "Lock Tokens" : "Connect Wallet"}
          </button>
        </form>
      </div>

      {/* Locks table */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Shield size={18} color="var(--accent)" />
          <h3 style={{ fontWeight: 700, fontSize: 16 }}>My Token Locks</h3>
        </div>

        {!isConnected ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontSize: 14 }}>Connect wallet to view locks</div>
        ) : isLoading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
        ) : !locks?.length ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontSize: 14 }}>No token locks yet</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Token", "Amount", "Unlock", "Status", ""].map(h => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", color: "var(--text-muted)", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {locks.map(lock => (
                  <tr key={lock.id} style={{ borderBottom: "1px solid rgba(30,58,95,0.5)" }}>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>{lock.tokenSymbol ?? lock.tokenAddress.slice(0, 8)}</td>
                    <td style={{ padding: "0.85rem 1rem" }}>{lock.amount}</td>
                    <td style={{ padding: "0.85rem 1rem", color: "var(--text-muted)" }}>{new Date(lock.unlockDate).toLocaleDateString()}</td>
                    <td style={{ padding: "0.85rem 1rem" }}><LockStatusBadge unlockDate={lock.unlockDate} withdrawn={lock.withdrawn} /></td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      {!lock.withdrawn && (
                        <button onClick={() => setSelectedLock(lock)} style={{ background: "rgba(0,200,150,0.15)", border: "1px solid rgba(0,200,150,0.3)", color: "var(--accent)", borderRadius: 6, padding: "3px 10px", fontSize: 12, cursor: "pointer" }}>
                          Manage
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedLock && (
        <LockActionModal
          lock={selectedLock}
          onClose={() => setSelectedLock(null)}
          onUpdated={() => queryClient.invalidateQueries({ queryKey: ["locks"] })}
        />
      )}
    </div>
  );
}

function FormField({ label, placeholder, value, onChange, type = "text" }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string;
}) {
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
