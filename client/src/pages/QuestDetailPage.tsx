import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, Calendar, Trophy, Loader } from "lucide-react";
import { useQuest, useLeaderboard, useQuestProgress, useVerifyTask } from "../hooks/useQuest";
import TaskItem from "../components/quest/TaskItem";
import Leaderboard from "../components/quest/Leaderboard";
import { useAccount } from "wagmi";

export default function QuestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: serverQuest, isLoading } = useQuest(id!);
  const quest = serverQuest;
  const { data: leaderboard } = useLeaderboard(id!);
  const { data: progress } = useQuestProgress(id!);
  const { verifying, results, verify } = useVerifyTask(id!);
  const { isConnected } = useAccount();

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "6rem", color: "var(--text-muted)" }}>
        <Loader size={24} style={{ animation: "spin 1s linear infinite" }} color="var(--accent)" />
      </div>
    );
  }

  if (!quest) {
    return (
      <div style={{ maxWidth: 700, margin: "4rem auto", padding: "0 1.5rem", textAlign: "center" }}>
        <div style={{ color: "var(--text-muted)", fontSize: 14, fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.1em" }}>QUEST NOT FOUND</div>
        <Link to="/quests" style={{ color: "var(--accent)", textDecoration: "none", marginTop: "1rem", display: "inline-block", fontSize: 12, fontFamily: "'Share Tech Mono', monospace" }}>← BACK TO QUESTS</Link>
      </div>
    );
  }

  const completedTaskIds = new Set<string>(progress?.completions?.map(c => c.taskId) ?? []);
  const totalPoints  = quest.tasks.reduce((s, t) => s + t.points, 0);
  const earnedPoints = progress?.progress?.pointsEarned ?? 0;
  const progressPct  = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const completedCount = completedTaskIds.size;
  const isLive = new Date(quest.startDate) <= new Date() && new Date(quest.endDate) > new Date();

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Back */}
      <Link to="/quests" style={{
        display: "inline-flex", alignItems: "center", gap: "0.4rem",
        color: "var(--text-muted)", textDecoration: "none", fontSize: 11,
        marginBottom: "1.5rem", fontFamily: "'Share Tech Mono', monospace",
        letterSpacing: "0.1em",
        transition: "color 0.12s",
      }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        <ArrowLeft size={13} /> BACK TO QUESTS
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "start" }}>

        {/* ── Main ─────────────────────────────────────────────────────────── */}
        <div>
          {/* Banner */}
          <div style={{
            height: 180, overflow: "hidden",
            background: "linear-gradient(135deg, var(--bg-deep), var(--bg-card2))",
            marginBottom: "1.5rem", position: "relative",
            borderTop: "2px solid var(--accent)",
          }}>
            {quest.bannerUrl && (
              <img src={quest.bannerUrl} alt={quest.title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />
            )}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 20%, rgba(6,14,26,0.92))" }} />

            <div style={{ position: "absolute", bottom: "1rem", left: "1.25rem" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--text-muted)", marginBottom: "0.3rem", fontFamily: "'Share Tech Mono', monospace" }}>
                {quest.projectName.toUpperCase()}
              </div>
              <h1 style={{
                fontWeight: 900, fontSize: 22, color: "var(--text)", margin: 0,
                fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.04em",
              }}>{quest.title}</h1>
            </div>

            <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", display: "flex", gap: "0.4rem" }}>
              {quest.featured && (
                <span style={{ background: "rgba(234,179,8,0.15)", color: "#eab308", border: "1px solid rgba(234,179,8,0.4)", padding: "2px 8px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", fontFamily: "'Share Tech Mono', monospace" }}>FEATURED</span>
              )}
              {isLive && (
                <span style={{ background: "rgba(212,175,55,0.15)", color: "var(--accent)", border: "1px solid var(--accent)", padding: "2px 8px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", fontFamily: "'Share Tech Mono', monospace", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 5, height: 5, background: "var(--accent)", animation: "punkPulse 2s ease-in-out infinite" }} />
                  LIVE
                </span>
              )}
            </div>
          </div>

          {/* Meta strip */}
          <div style={{
            display: "flex", gap: "1.5rem", marginBottom: "1.25rem",
            fontSize: 10, color: "var(--text-muted)",
            fontFamily: "'Share Tech Mono', monospace",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Users size={11} />{quest.totalParticipants.toLocaleString()} PARTICIPANTS
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Calendar size={11} />ENDS {new Date(quest.endDate).toLocaleDateString()}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Trophy size={11} />{totalPoints} TOTAL PTS
            </div>
          </div>

          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.7, marginBottom: "1.75rem" }}>
            {quest.description}
          </p>

          {/* Progress bar */}
          {isConnected && (
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderLeft: "3px solid var(--accent)",
              padding: "1rem 1.25rem", marginBottom: "1.5rem",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: "0.6rem", fontFamily: "'Share Tech Mono', monospace" }}>
                <span style={{ color: "var(--text-muted)", letterSpacing: "0.1em" }}>YOUR PROGRESS</span>
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>
                  {completedCount}/{quest.tasks.length} TASKS · {earnedPoints}/{totalPoints} PTS ({progressPct}%)
                </span>
              </div>
              <div style={{ height: 6, background: "var(--bg-input)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${progressPct}%`,
                  background: "linear-gradient(90deg, var(--accent), var(--accent-hover))",
                  transition: "width 0.5s ease",
                  boxShadow: "0 0 8px var(--accent-glow)",
                }} />
              </div>
            </div>
          )}

          {/* Tasks */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem" }}>
            <div style={{ width: 2, height: 14, background: "var(--accent)" }} />
            <h2 style={{
              fontWeight: 800, fontSize: 13, margin: 0,
              letterSpacing: "0.18em", color: "var(--text)",
              fontFamily: "'Share Tech Mono', monospace",
            }}>TASKS ({quest.tasks.length})</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {quest.tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                completed={completedTaskIds.has(task.id)}
                onVerify={verify}
                isVerifying={verifying === task.id}
                result={results[task.id]}
              />
            ))}
          </div>

          {/* Rewards */}
          {quest.rewards.length > 0 && (
            <div style={{ marginTop: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem" }}>
                <div style={{ width: 2, height: 14, background: "#eab308" }} />
                <h2 style={{
                  fontWeight: 800, fontSize: 13, margin: 0,
                  letterSpacing: "0.18em", color: "#eab308",
                  fontFamily: "'Share Tech Mono', monospace",
                }}>REWARDS</h2>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {quest.rewards.map(r => (
                  <div key={r.id} style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderTop: "2px solid #eab308",
                    padding: "0.75rem 1rem",
                  }}>
                    <div style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--text-muted)", marginBottom: "0.25rem", fontFamily: "'Share Tech Mono', monospace" }}>
                      {r.type.toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 14, fontFamily: "'Rajdhani', sans-serif" }}>{r.label}</div>
                    {r.amount && r.symbol && (
                      <div style={{ fontSize: 12, color: "#eab308", fontFamily: "'Share Tech Mono', monospace", marginTop: "0.15rem" }}>{r.amount} {r.symbol}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar leaderboard ──────────────────────────────────────────── */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderTop: "2px solid var(--accent)",
          padding: "1.25rem", position: "sticky", top: 80,
        }}>
          <Leaderboard entries={leaderboard ?? []} />
        </div>
      </div>
    </div>
  );
}
