import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, useSendTransaction, useChainId } from "wagmi";
import { parseEther } from "viem";
import { Plus, Trash2, ChevronRight, ChevronLeft, Zap, CheckCircle2, Loader, ExternalLink } from "lucide-react";
import { questApi, type QuestSubmissionInput } from "../api/client";

const QUEST_FEE = "0.05";
// Set this to your fee recipient wallet address
const FEE_RECIPIENT = import.meta.env.VITE_FEE_RECIPIENT_ADDRESS ?? "0x0000000000000000000000000000000000000000";

const NATIVE_SYMBOL: Record<number, string> = { 1: "ETH", 8453: "ETH", 42161: "ETH", 10: "ETH", 4217: "USD" };
const EXPLORER_BASE: Record<number, string> = { 1: "https://etherscan.io", 8453: "https://basescan.org", 4217: "https://explore.mainnet.tempo.xyz" };

const TASK_TYPES = [
  { value: "twitter_follow",  label: "Twitter Follow"  },
  { value: "twitter_retweet", label: "Twitter Retweet" },
  { value: "discord_join",    label: "Discord Join"    },
  { value: "onchain",         label: "On-Chain Action" },
  { value: "quiz",            label: "Quiz Question"   },
  { value: "visit",           label: "Visit URL"       },
];

type Task = QuestSubmissionInput["tasks"][number] & { quizOptions?: string[]; quizAnswer?: string };
type Reward = QuestSubmissionInput["rewards"][number];

const STEPS = ["DETAILS", "TASKS", "REWARDS", "PAY & SUBMIT"];

function inputStyle(error?: boolean): React.CSSProperties {
  return {
    width: "100%", boxSizing: "border-box",
    background: "var(--bg-input)",
    border: `1px solid ${error ? "#f87171" : "var(--border)"}`,
    padding: "0.6rem 0.85rem",
    color: "var(--text)", fontSize: 13, outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.12s",
  };
}

function labelStyle(): React.CSSProperties {
  return {
    display: "block", fontSize: 9, fontWeight: 800,
    letterSpacing: "0.18em", color: "var(--text-muted)",
    fontFamily: "'Share Tech Mono', monospace",
    marginBottom: "0.4rem",
  };
}

export default function CreateQuestPage() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const nativeSymbol = NATIVE_SYMBOL[chainId] ?? "ETH";
  const explorerBase = EXPLORER_BASE[chainId] ?? "https://etherscan.io";
  const { sendTransactionAsync } = useSendTransaction();

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1 — Details
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectUrl, setProjectUrl]   = useState("");
  const [bannerUrl, setBannerUrl]     = useState("");
  const [startDate, setStartDate]     = useState("");
  const [endDate, setEndDate]         = useState("");
  const [tags, setTags]               = useState("");

  // Step 2 — Tasks
  const [tasks, setTasks] = useState<Task[]>([
    { type: "twitter_follow", title: "", description: "", points: 50, required: false },
  ]);

  // Step 3 — Rewards
  const [rewards, setRewards] = useState<Reward[]>([
    { type: "token", label: "", symbol: "", amount: "" },
  ]);

  // Step 4 — Pay
  const [txHash, setTxHash]         = useState("");
  const [sending, setSending]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ── Validation ──────────────────────────────────────────────────────────────

  function validateStep0() {
    const e: Record<string, string> = {};
    if (!title.trim())       e.title       = "Required";
    if (!description.trim()) e.description = "Required";
    if (!projectName.trim()) e.projectName = "Required";
    if (!startDate)          e.startDate   = "Required";
    if (!endDate)            e.endDate     = "Required";
    if (endDate && startDate && new Date(endDate) <= new Date(startDate))
      e.endDate = "Must be after start date";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep1() {
    const e: Record<string, string> = {};
    tasks.forEach((t, i) => {
      if (!t.title.trim())       e[`task_${i}_title`] = "Required";
      if (!t.description.trim()) e[`task_${i}_desc`]  = "Required";
      if (!t.points || t.points < 1) e[`task_${i}_pts`] = "Min 1";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Task helpers ─────────────────────────────────────────────────────────────

  function addTask() {
    setTasks(prev => [...prev, { type: "onchain", title: "", description: "", points: 100, required: false }]);
  }

  function removeTask(i: number) {
    setTasks(prev => prev.filter((_, idx) => idx !== i));
  }

  function updateTask(i: number, patch: Partial<Task>) {
    setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, ...patch } : t));
  }

  // ── Reward helpers ───────────────────────────────────────────────────────────

  function addReward() {
    setRewards(prev => [...prev, { type: "token", label: "", symbol: "", amount: "" }]);
  }

  function removeReward(i: number) {
    setRewards(prev => prev.filter((_, idx) => idx !== i));
  }

  function updateReward(i: number, patch: Partial<Reward>) {
    setRewards(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  }

  // ── Pay fee ──────────────────────────────────────────────────────────────────

  async function payFee() {
    setSending(true);
    try {
      const hash = await sendTransactionAsync({
        to:    FEE_RECIPIENT as `0x${string}`,
        value: parseEther(QUEST_FEE),
      });
      setTxHash(hash);
    } catch (err: unknown) {
      setSubmitError((err as Error).message ?? "Transaction rejected");
    } finally {
      setSending(false);
    }
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  async function submitQuest() {
    if (!txHash) { setSubmitError("Pay the fee first"); return; }
    setSubmitting(true);
    setSubmitError("");
    try {
      const payload: QuestSubmissionInput = {
        paymentTxHash:  txHash,
        paymentChainId: chainId,
        title, description, projectName,
        projectUrl:  projectUrl  || undefined,
        bannerUrl:   bannerUrl   || undefined,
        startDate:   new Date(startDate).toISOString(),
        endDate:     new Date(endDate).toISOString(),
        tags:        tags.split(",").map(t => t.trim()).filter(Boolean),
        tasks: tasks.map(t => ({
          type:        t.type,
          title:       t.title,
          description: t.description,
          points:      t.points,
          required:    t.required,
          link:        t.link,
          metadata:    t.type === "quiz" && t.quizOptions
            ? { options: t.quizOptions.filter(Boolean), answer: t.quizAnswer }
            : undefined,
        })),
        rewards: rewards
          .filter(r => r.label)
          .map(r => ({ type: r.type, label: r.label, symbol: r.symbol || undefined, amount: r.amount || undefined })),
      };
      await questApi.submit(payload);
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError((err as Error).message ?? "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (!isConnected) {
    return (
      <div style={{ maxWidth: 560, margin: "6rem auto", padding: "0 1.5rem", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.14em" }}>
          CONNECT WALLET TO CREATE A QUEST
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 560, margin: "6rem auto", padding: "0 1.5rem", textAlign: "center" }}>
        <CheckCircle2 size={40} color="var(--accent)" style={{ marginBottom: "1rem" }} />
        <h2 style={{ fontWeight: 900, fontSize: 20, fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
          QUEST SUBMITTED
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'Share Tech Mono', monospace", marginBottom: "1.5rem", lineHeight: 1.7 }}>
          Your quest is pending admin review. You'll be notified once it's approved. Check status under Profile → Submissions.
        </p>
        <button
          onClick={() => navigate("/quests")}
          style={{ padding: "0.5rem 1.5rem", background: "var(--accent)", border: "none", color: "var(--bg-deep)", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", cursor: "pointer", fontFamily: "'Share Tech Mono', monospace" }}
        >
          BACK TO QUESTS
        </button>
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    background: "var(--bg-card)", border: "1px solid var(--border)",
    borderTop: "2px solid var(--accent)",
    padding: "1.75rem",
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1.5rem" }}>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
          <div style={{ width: 2, height: 22, background: "var(--accent)", boxShadow: "0 0 8px var(--accent-glow)" }} />
          <h1 style={{ fontWeight: 900, fontSize: 22, margin: 0, fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.08em" }}>
            CREATE QUEST
          </h1>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0, fontFamily: "'Share Tech Mono', monospace" }}>
          Third-party quest submissions require a {QUEST_FEE} {nativeSymbol} listing fee and admin approval.
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: 0, marginBottom: "2rem" }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              width: "100%", height: 3,
              background: i <= step ? "var(--accent)" : "var(--border)",
              transition: "background 0.2s",
              boxShadow: i <= step ? "0 0 8px var(--accent-glow)" : "none",
            }} />
            <div style={{
              fontSize: 8, fontWeight: 800, letterSpacing: "0.14em",
              color: i === step ? "var(--accent)" : i < step ? "var(--text-muted)" : "var(--border)",
              fontFamily: "'Share Tech Mono', monospace",
              marginTop: "0.4rem",
            }}>{s}</div>
          </div>
        ))}
      </div>

      {/* ── Step 0: Details ──────────────────────────────────────────────────── */}
      {step === 0 && (
        <div style={cardStyle}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle()}>QUEST TITLE *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Genesis Campaign" style={inputStyle(!!errors.title)} />
              {errors.title && <div style={{ fontSize: 10, color: "#f87171", marginTop: "0.25rem" }}>{errors.title}</div>}
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle()}>DESCRIPTION *</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your quest and what participants should do..." rows={4}
                style={{ ...inputStyle(!!errors.description), resize: "vertical" }} />
              {errors.description && <div style={{ fontSize: 10, color: "#f87171", marginTop: "0.25rem" }}>{errors.description}</div>}
            </div>
            <div>
              <label style={labelStyle()}>PROJECT NAME *</label>
              <input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Your Project" style={inputStyle(!!errors.projectName)} />
              {errors.projectName && <div style={{ fontSize: 10, color: "#f87171", marginTop: "0.25rem" }}>{errors.projectName}</div>}
            </div>
            <div>
              <label style={labelStyle()}>PROJECT URL</label>
              <input value={projectUrl} onChange={e => setProjectUrl(e.target.value)} placeholder="https://yourproject.xyz" style={inputStyle()} />
            </div>
            <div>
              <label style={labelStyle()}>START DATE *</label>
              <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle(!!errors.startDate)} />
              {errors.startDate && <div style={{ fontSize: 10, color: "#f87171", marginTop: "0.25rem" }}>{errors.startDate}</div>}
            </div>
            <div>
              <label style={labelStyle()}>END DATE *</label>
              <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle(!!errors.endDate)} />
              {errors.endDate && <div style={{ fontSize: 10, color: "#f87171", marginTop: "0.25rem" }}>{errors.endDate}</div>}
            </div>
            <div>
              <label style={labelStyle()}>BANNER URL</label>
              <input value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} placeholder="https://..." style={inputStyle()} />
            </div>
            <div>
              <label style={labelStyle()}>TAGS (comma separated)</label>
              <input value={tags} onChange={e => setTags(e.target.value)} placeholder="DeFi, NFT, Social" style={inputStyle()} />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 1: Tasks ────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div style={cardStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {tasks.map((task, i) => (
              <div key={i} style={{ background: "var(--bg-input)", border: "1px solid var(--border)", padding: "1rem", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "var(--accent)", fontFamily: "'Share Tech Mono', monospace" }}>
                    TASK {i + 1}
                  </span>
                  {tasks.length > 1 && (
                    <button onClick={() => removeTask(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171", padding: 0 }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={labelStyle()}>TYPE</label>
                    <select value={task.type} onChange={e => updateTask(i, { type: e.target.value })}
                      style={{ ...inputStyle(), appearance: "none" }}>
                      {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle()}>POINTS</label>
                    <input type="number" min={1} value={task.points}
                      onChange={e => updateTask(i, { points: parseInt(e.target.value) || 0 })}
                      style={inputStyle(!!errors[`task_${i}_pts`])} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle()}>TITLE *</label>
                    <input value={task.title} onChange={e => updateTask(i, { title: e.target.value })}
                      placeholder="e.g. Follow us on X" style={inputStyle(!!errors[`task_${i}_title`])} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle()}>DESCRIPTION *</label>
                    <input value={task.description} onChange={e => updateTask(i, { description: e.target.value })}
                      placeholder="Brief instruction for the user" style={inputStyle(!!errors[`task_${i}_desc`])} />
                  </div>
                  {["twitter_follow","twitter_retweet","discord_join","visit"].includes(task.type) && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle()}>LINK URL</label>
                      <input value={task.link ?? ""} onChange={e => updateTask(i, { link: e.target.value })}
                        placeholder="https://..." style={inputStyle()} />
                    </div>
                  )}
                  {task.type === "quiz" && (
                    <>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle()}>OPTIONS (one per line)</label>
                        <textarea
                          value={(task.quizOptions ?? [""]).join("\n")}
                          onChange={e => updateTask(i, { quizOptions: e.target.value.split("\n") })}
                          rows={4} placeholder={"Option A\nOption B\nOption C\nOption D"}
                          style={{ ...inputStyle(), resize: "vertical" }}
                        />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle()}>CORRECT ANSWER (exact match)</label>
                        <input value={task.quizAnswer ?? ""} onChange={e => updateTask(i, { quizAnswer: e.target.value })}
                          placeholder="Option A" style={inputStyle()} />
                      </div>
                    </>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input type="checkbox" id={`req-${i}`} checked={task.required}
                      onChange={e => updateTask(i, { required: e.target.checked })}
                      style={{ accentColor: "var(--accent)", width: 14, height: 14 }} />
                    <label htmlFor={`req-${i}`} style={{ fontSize: 10, color: "var(--text-muted)", cursor: "pointer", fontFamily: "'Share Tech Mono', monospace" }}>
                      REQUIRED TASK
                    </label>
                  </div>
                </div>
              </div>
            ))}

            <button onClick={addTask} style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              padding: "0.5rem 1rem",
              background: "transparent", border: "1px dashed var(--border)",
              color: "var(--text-muted)", cursor: "pointer",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
              fontFamily: "'Share Tech Mono', monospace",
              transition: "all 0.12s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <Plus size={13} /> ADD TASK
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Rewards ──────────────────────────────────────────────────── */}
      {step === 2 && (
        <div style={cardStyle}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", marginBottom: "1rem" }}>
            Optional — describe what participants will earn for completing this quest.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {rewards.map((r, i) => (
              <div key={i} style={{ background: "var(--bg-input)", border: "1px solid var(--border)", padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "var(--accent)", fontFamily: "'Share Tech Mono', monospace" }}>REWARD {i + 1}</span>
                  {rewards.length > 1 && (
                    <button onClick={() => removeReward(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171", padding: 0 }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", gap: "0.75rem" }}>
                  <div>
                    <label style={labelStyle()}>TYPE</label>
                    <select value={r.type} onChange={e => updateReward(i, { type: e.target.value })}
                      style={{ ...inputStyle(), appearance: "none" }}>
                      <option value="token">Token</option>
                      <option value="nft">NFT</option>
                      <option value="whitelist">Whitelist</option>
                      <option value="points">Points</option>
                    </select>
                  </div>
                  {r.type === "token" && (
                    <>
                      <div>
                        <label style={labelStyle()}>SYMBOL</label>
                        <input value={r.symbol ?? ""} onChange={e => updateReward(i, { symbol: e.target.value })} placeholder="USDC" style={inputStyle()} />
                      </div>
                      <div>
                        <label style={labelStyle()}>AMOUNT</label>
                        <input value={r.amount ?? ""} onChange={e => updateReward(i, { amount: e.target.value })} placeholder="1000" style={inputStyle()} />
                      </div>
                    </>
                  )}
                  <div style={{ gridColumn: r.type === "token" ? "4" : "2 / -1" }}>
                    <label style={labelStyle()}>LABEL</label>
                    <input value={r.label} onChange={e => updateReward(i, { label: e.target.value })} placeholder="e.g. 1,000 USDC" style={inputStyle()} />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addReward} style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              padding: "0.5rem 1rem",
              background: "transparent", border: "1px dashed var(--border)",
              color: "var(--text-muted)", cursor: "pointer",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
              fontFamily: "'Share Tech Mono', monospace",
              transition: "all 0.12s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <Plus size={13} /> ADD REWARD
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Pay & Submit ─────────────────────────────────────────────── */}
      {step === 3 && (
        <div style={cardStyle}>
          {/* Fee info */}
          <div style={{
            background: "var(--bg-input)", border: "1px solid var(--border)",
            borderLeft: "3px solid var(--accent)",
            padding: "1rem 1.25rem", marginBottom: "1.5rem",
          }}>
            <div style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", marginBottom: "0.5rem" }}>
              LISTING FEE
            </div>
            <div style={{ fontWeight: 900, fontSize: 28, fontFamily: "'Rajdhani', sans-serif", color: "var(--accent)", lineHeight: 1 }}>
              {QUEST_FEE} {nativeSymbol}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", marginTop: "0.35rem" }}>
              One-time fee per quest submission. Covers admin review costs. Non-refundable if rejected.
            </div>
          </div>

          {/* Fee recipient */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={labelStyle()}>FEE RECIPIENT ADDRESS</label>
            <div style={{
              padding: "0.6rem 0.85rem",
              background: "var(--bg-input)", border: "1px solid var(--border)",
              fontSize: 12, color: "var(--text)", fontFamily: "'Share Tech Mono', monospace",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span>{FEE_RECIPIENT}</span>
              <a href={`${explorerBase}/address/${FEE_RECIPIENT}`} target="_blank" rel="noreferrer"
                style={{ color: "var(--text-muted)", display: "flex" }}>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Pay button */}
          {!txHash ? (
            <button
              onClick={payFee}
              disabled={sending}
              style={{
                width: "100%", padding: "0.75rem",
                background: sending ? "transparent" : "var(--accent)",
                border: `1px solid var(--accent)`,
                color: sending ? "var(--accent)" : "var(--bg-deep)",
                cursor: sending ? "not-allowed" : "pointer",
                fontSize: 12, fontWeight: 900, letterSpacing: "0.12em",
                fontFamily: "'Share Tech Mono', monospace",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                boxShadow: sending ? "none" : "0 0 20px var(--accent-glow)",
                marginBottom: "1rem",
              }}
            >
              {sending ? <><Loader size={13} style={{ animation: "spin 1s linear infinite" }} /> SENDING…</> : <><Zap size={13} /> PAY {QUEST_FEE} {nativeSymbol}</>}
            </button>
          ) : (
            <div style={{
              padding: "0.75rem 1rem", marginBottom: "1rem",
              background: "rgba(212,175,55,0.1)", border: "1px solid var(--accent)",
              display: "flex", alignItems: "center", gap: "0.5rem",
            }}>
              <CheckCircle2 size={14} color="var(--accent)" />
              <div>
                <div style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--accent)", fontFamily: "'Share Tech Mono', monospace" }}>PAYMENT CONFIRMED</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", marginTop: "0.15rem" }}>
                  {txHash.slice(0, 20)}…{txHash.slice(-8)}
                </div>
              </div>
            </div>
          )}

          {/* Manual tx hash fallback */}
          {!txHash && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle()}>OR PASTE TRANSACTION HASH (if you paid manually)</label>
              <input
                value={txHash}
                onChange={e => setTxHash(e.target.value)}
                placeholder="0x..."
                style={inputStyle()}
              />
            </div>
          )}

          {submitError && (
            <div style={{ fontSize: 11, color: "#f87171", fontFamily: "'Share Tech Mono', monospace", marginBottom: "0.75rem", letterSpacing: "0.06em" }}>
              ✗ {submitError}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={submitQuest}
            disabled={!txHash || submitting}
            style={{
              width: "100%", padding: "0.75rem",
              background: txHash && !submitting ? "var(--punk)" : "transparent",
              border: `1px solid ${txHash ? "var(--punk)" : "var(--border)"}`,
              color: txHash && !submitting ? "#fff" : "var(--text-muted)",
              cursor: txHash && !submitting ? "pointer" : "not-allowed",
              fontSize: 12, fontWeight: 900, letterSpacing: "0.12em",
              fontFamily: "'Share Tech Mono', monospace",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            }}
          >
            {submitting ? <><Loader size={13} style={{ animation: "spin 1s linear infinite" }} /> SUBMITTING…</> : "SUBMIT FOR REVIEW"}
          </button>

          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", marginTop: "0.75rem", lineHeight: 1.6 }}>
            Submissions are reviewed within 48 hours. Your wallet ({address?.slice(0, 6)}…{address?.slice(-4)}) will be linked to this submission.
          </div>
        </div>
      )}

      {/* ── Nav buttons ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.25rem" }}>
        <button
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          style={{
            display: "flex", alignItems: "center", gap: "0.4rem",
            padding: "0.5rem 1.25rem",
            background: "transparent", border: "1px solid var(--border)",
            color: step === 0 ? "var(--border)" : "var(--text-muted)",
            cursor: step === 0 ? "not-allowed" : "pointer",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
            fontFamily: "'Share Tech Mono', monospace",
          }}
        >
          <ChevronLeft size={13} /> BACK
        </button>

        {step < 3 && (
          <button
            onClick={() => {
              const valid = step === 0 ? validateStep0() : step === 1 ? validateStep1() : true;
              if (valid) setStep(s => s + 1);
            }}
            style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              padding: "0.5rem 1.25rem",
              background: "var(--accent)", border: "none",
              color: "var(--bg-deep)",
              cursor: "pointer",
              fontSize: 11, fontWeight: 900, letterSpacing: "0.1em",
              fontFamily: "'Share Tech Mono', monospace",
              boxShadow: "0 0 14px var(--accent-glow)",
            }}
          >
            NEXT <ChevronRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
