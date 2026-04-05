import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, TrendingUp, Medal, BarChart2 } from "lucide-react";
import { questApi, type LeaderboardEntry } from "../api/client";
import { useQuests } from "../hooks/useQuest";

const PERIODS = ["24H", "7D", "30D", "All Time"] as const;
type Period = typeof PERIODS[number];

function shortAddr(addr: string) {
  return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={16} color="#FFD700" />;
  if (rank === 2) return <Medal size={16} color="#C0C0C0" />;
  if (rank === 3) return <Medal size={16} color="#CD7F32" />;
  return <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-muted)", width: 16, textAlign: "center" }}>{rank}</span>;
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("7D");
  const [questId, setQuestId] = useState<string | null>(null);

  const { data: quests } = useQuests();

  const { data: entries, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", questId],
    queryFn: () => questApi.leaderboard(questId!),
    enabled: !!questId,
    staleTime: 30_000,
  });

  const rows = entries ?? [];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 26, marginBottom: "0.2rem" }}>Leaderboard</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Top participants ranked by quest points</p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {/* Quest selector */}
          {quests && quests.length > 0 && (
            <select
              value={questId ?? ""}
              onChange={e => setQuestId(e.target.value || null)}
              style={{
                padding: "0.35rem 0.85rem", borderRadius: 8, border: "1px solid var(--border)",
                background: "var(--bg-card)", color: "var(--text)", fontSize: 12, cursor: "pointer",
              }}
            >
              <option value="">Select a quest…</option>
              {quests.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
            </select>
          )}

          {/* Period selector */}
          <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: "0.2rem", gap: "0.2rem" }}>
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: "0.35rem 0.85rem", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  background: period === p ? "var(--bg-card2)" : "transparent",
                  color: period === p ? "var(--accent)" : "var(--text-muted)",
                  transition: "all 0.15s",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: 56, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, animation: "pulse 1.5s infinite" }} />)}
        </div>
      ) : rows.length > 0 ? (
        <>
          {/* Top 3 podium */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            {rows.slice(0, 3).map(t => (
              <div key={t.rank} style={{ flex: 1, minWidth: 200, background: "rgba(11,21,39,0.85)", border: `1px solid ${t.rank === 1 ? "#FFD70044" : "var(--border)"}`, borderRadius: 16, padding: "1.25rem", textAlign: "center" }}>
                <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "center" }}>
                  <RankIcon rank={t.rank} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: "0.25rem" }}>{shortAddr(t.address)}</div>
                <div style={{ fontWeight: 800, fontSize: 22, color: "var(--accent)", marginBottom: "0.15rem" }}>{t.points.toLocaleString()} pts</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.tasksCompleted} tasks</div>
              </div>
            ))}
          </div>

          {/* Full table */}
          <div style={{ background: "rgba(11,21,39,0.85)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 120px 80px", padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <span>#</span>
              <span>Address</span>
              <span style={{ textAlign: "right" }}>Points</span>
              <span style={{ textAlign: "right" }}>Tasks</span>
            </div>

            {rows.map((t, i) => (
              <div
                key={t.rank}
                style={{
                  display: "grid", gridTemplateColumns: "48px 1fr 120px 80px",
                  padding: "0.9rem 1.25rem",
                  borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none",
                  alignItems: "center",
                  background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}><RankIcon rank={t.rank} /></div>
                <div style={{ fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg-input)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <TrendingUp size={12} color="var(--accent)" />
                  </div>
                  {shortAddr(t.address)}
                </div>
                <div style={{ textAlign: "right", fontWeight: 700, fontSize: 13, color: "var(--accent)" }}>{t.points.toLocaleString()}</div>
                <div style={{ textAlign: "right", fontSize: 12, color: "var(--text-muted)" }}>{t.tasksCompleted}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "5rem 1rem", background: "rgba(11,21,39,0.85)", border: "1px solid var(--border)", borderRadius: 16 }}>
          <BarChart2 size={36} style={{ opacity: 0.2, marginBottom: "1rem" }} />
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: "0.5rem" }}>
            {questId ? "No participants yet" : "Select a quest to view rankings"}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {questId ? "Be the first to complete tasks and claim the top spot." : "Choose a quest from the dropdown above."}
          </div>
        </div>
      )}
    </div>
  );
}
