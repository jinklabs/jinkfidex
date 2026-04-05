import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Coins, TrendingUp, Lock, Gift, Info, Layers } from "lucide-react";
import { stakingApi, type StakingSubmission } from "../api/client";

export default function StakingPage() {
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["staking-approved"],
    queryFn: () => stakingApi.listSubmissions("APPROVED"),
    staleTime: 60_000,
    retry: false,
  });

  const pools = submissions ?? [];

  const avgApy   = pools.length
    ? pools.reduce((s, p) => s + p.apy, 0) / pools.length
    : 0;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontWeight: 800, fontSize: 26, marginBottom: "0.2rem" }}>Staking</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Stake tokens in approved community pools to earn rewards</p>
      </div>

      {/* Stats bar */}
      <div className="stats-grid-3" style={{ marginBottom: "1.5rem" }}>
        {[
          { label: "Active Pools",  value: pools.length || "—",                              icon: Lock,       color: "var(--accent)" },
          { label: "Avg. APY",      value: avgApy > 0 ? `${avgApy.toFixed(1)}%` : "—",       icon: TrendingUp, color: "#4ade80"       },
          { label: "Total Stakers", value: "—",                                               icon: Coins,      color: "#60a5fa"       },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: "rgba(11,21,39,0.85)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(0,200,150,0.1)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: "0.2rem" }}>{label}</div>
              <div style={{ fontWeight: 800, fontSize: 20, color }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[1, 2].map(i => <div key={i} style={{ height: 120, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, animation: "pulse 1.5s infinite" }} />)}
        </div>
      ) : pools.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {pools.map(pool => (
            <PoolCard key={pool.id} pool={pool} amount={amounts[pool.id] ?? ""} onAmountChange={v => setAmounts(prev => ({ ...prev, [pool.id]: v }))} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "5rem 1rem", background: "rgba(11,21,39,0.85)", border: "1px solid var(--border)", borderRadius: 16 }}>
          <Layers size={36} style={{ opacity: 0.2, marginBottom: "1rem" }} />
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: "0.5rem" }}>No staking pools available</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Approved pools from project submissions will appear here.</div>
        </div>
      )}
    </div>
  );
}

function PoolCard({ pool, amount, onAmountChange }: { pool: StakingSubmission; amount: string; onAmountChange: (v: string) => void }) {
  const color = "#00c896";

  return (
    <div style={{ background: "rgba(11,21,39,0.85)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.25rem", animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${color}22`, border: `1px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Coins size={16} color={color} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{pool.projectName}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{pool.tokenSymbol}</div>
            </div>
            {pool.lockDays > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}20`, border: `1px solid ${color}40`, padding: "2px 7px", borderRadius: 5 }}>
                {pool.lockDays}D LOCK
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>APY</div>
              <div style={{ fontWeight: 800, fontSize: 22, color }}>{pool.apy.toFixed(1)}%</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Min Stake</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{pool.minStake} {pool.tokenSymbol}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Rewards</div>
              <div style={{ fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Gift size={12} color="var(--neon)" /> {pool.rewardTokenSymbol}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 10, padding: "0.5rem 0.75rem", gap: "0.5rem" }}>
            <input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={e => onAmountChange(e.target.value)}
              style={{ background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 15, fontWeight: 700, width: 100 }}
            />
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{pool.tokenSymbol}</span>
          </div>
          <button
            style={{
              padding: "0.6rem 1.1rem", borderRadius: 10, border: "none", fontWeight: 800, fontSize: 14,
              background: amount ? `linear-gradient(135deg, ${color}, #009e78)` : "rgba(58,77,102,0.35)",
              color: amount ? "#fff" : "var(--text-muted)",
              cursor: amount ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
          >
            Stake
          </button>
        </div>
      </div>

      {pool.lockDays > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.75rem", fontSize: 11, color: "var(--text-muted)", padding: "0.4rem 0.6rem", background: "rgba(0,0,0,0.2)", borderRadius: 6 }}>
          <Info size={11} /> Tokens are locked for {pool.lockDays} days after staking
        </div>
      )}
    </div>
  );
}
