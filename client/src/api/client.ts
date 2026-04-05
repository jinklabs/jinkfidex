const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

function getToken(): string | null {
  return localStorage.getItem("jinkfi_token");
}

export function setToken(token: string) {
  localStorage.setItem("jinkfi_token", token);
}

export function clearToken() {
  localStorage.removeItem("jinkfi_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// ── Typed endpoint helpers ────────────────────────────────────────────────────
export const authApi = {
  getNonce: (address: string) => api.get<{ nonce: string }>(`/auth/nonce/${address}`),
  verify: (message: string, signature: string) =>
    api.post<{ token: string; user: { id: string; address: string } }>("/auth/verify", { message, signature }),
  me: () => api.get<{ user: { id: string; address: string; username: string | null } }>("/auth/me"),
};

export const questApi = {
  list: () => api.get<Quest[]>("/quests"),
  get: (id: string) => api.get<Quest>(`/quests/${id}`),
  leaderboard: (id: string) => api.get<LeaderboardEntry[]>(`/quests/${id}/leaderboard`),
  progress: (id: string) => api.get<QuestProgress>(`/quests/${id}/progress`),
  verifyTask: (questId: string, taskId: string, body: { answer?: string; txHash?: string; twitterUserId?: string; discordUserId?: string }) =>
    api.post<{ success: boolean; pointsEarned: number }>(`/quests/${questId}/tasks/${taskId}/verify`, body),
  // Submissions
  submit: (body: QuestSubmissionInput) =>
    api.post<{ id: string; status: string }>("/quests/submit", body),
  mySubmissions: () =>
    api.get<QuestSubmissionSummary[]>("/quests/submissions/mine"),
  listSubmissions: (status?: string) =>
    api.get<QuestSubmission[]>(`/quests/submissions${status ? `?status=${status}` : ""}`),
  approveSubmission: (id: string, adminNote?: string) =>
    api.post<{ questId: string }>(`/quests/submissions/${id}/approve`, { adminNote }),
  rejectSubmission: (id: string, adminNote?: string) =>
    api.post<{ success: boolean }>(`/quests/submissions/${id}/reject`, { adminNote }),
};

export const stakingApi = {
  submit: (body: StakingSubmissionInput) =>
    api.post<{ id: string; status: string }>("/staking/submit", body),
  mySubmissions: () =>
    api.get<StakingSubmissionSummary[]>("/staking/submissions/mine"),
  listSubmissions: (status?: string) =>
    api.get<StakingSubmission[]>(`/staking/submissions${status ? `?status=${status}` : ""}`),
  approveSubmission: (id: string, adminNote?: string) =>
    api.post<{ success: boolean }>(`/staking/submissions/${id}/approve`, { adminNote }),
  rejectSubmission: (id: string, adminNote?: string) =>
    api.post<{ success: boolean }>(`/staking/submissions/${id}/reject`, { adminNote }),
};

export const perpsApi = {
  submit: (body: PerpsSubmissionInput) =>
    api.post<{ id: string; status: string }>("/perps/submit", body),
  mySubmissions: () =>
    api.get<PerpsSubmissionSummary[]>("/perps/submissions/mine"),
  listSubmissions: (status?: string) =>
    api.get<PerpsSubmission[]>(`/perps/submissions${status ? `?status=${status}` : ""}`),
  approveSubmission: (id: string, adminNote?: string) =>
    api.post<{ success: boolean }>(`/perps/submissions/${id}/approve`, { adminNote }),
  rejectSubmission: (id: string, adminNote?: string) =>
    api.post<{ success: boolean }>(`/perps/submissions/${id}/reject`, { adminNote }),
};

export const poolApi = {
  list: (chainId = 4217) => api.get<Pool[]>(`/pools?chainId=${chainId}`),
  get: (address: string, chainId = 4217) => api.get<Pool>(`/pools/${address}?chainId=${chainId}`),
};

export const farmApi = {
  list: (chainId = 4217) => api.get<Farm[]>(`/farms?chainId=${chainId}`),
};

export const lockApi = {
  list: (params?: { owner?: string; type?: string; chainId?: number }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<Lock[]>(`/locks${q ? `?${q}` : ""}`);
  },
  get: (id: string) => api.get<Lock>(`/locks/${id}`),
  create: (data: Partial<Lock>) => api.post<Lock>("/locks", data),
  withdraw: (id: string) => api.patch<Lock>(`/locks/${id}/withdraw`, {}),
};

// ── API types ─────────────────────────────────────────────────────────────────
export interface Quest {
  id: string; title: string; description: string; bannerUrl?: string;
  projectName: string; startDate: string; endDate: string;
  totalParticipants: number; totalPoints: number; featured: boolean;
  tags: string[]; rewards: QuestReward[]; tasks: QuestTask[];
}
export interface QuestTask {
  id: string; type: string; title: string; description: string;
  points: number; required: boolean; link?: string; metadata?: Record<string, unknown>;
}
export interface QuestReward { id: string; type: string; symbol?: string; amount?: string; label: string; }
export interface QuestProgress {
  progress: { pointsEarned: number; completed: boolean; completedAt?: string } | null;
  completions: { taskId: string; completedAt: string }[];
}
export interface LeaderboardEntry { rank: number; address: string; points: number; tasksCompleted: number; }
export interface Pool {
  id: string; address: string; chainId: number;
  token0Symbol: string; token1Symbol: string;
  reserve0: string; reserve1: string;
  tvlUSD: number; volume24h: number; apr: number; feeTier: string;
}
export interface Farm {
  id: string; pid: number; chainId: number; name: string; lpToken: string;
  token0Symbol: string; token1Symbol: string; rewardSymbol: string;
  aprPercent: number; tvlUSD: number; multiplier: string;
}
export interface QuestSubmissionInput {
  paymentTxHash:  string;
  paymentChainId: number;
  title:          string;
  description:    string;
  projectName:    string;
  projectUrl?:    string;
  bannerUrl?:     string;
  startDate:      string;
  endDate:        string;
  tags:           string[];
  tasks: Array<{
    type: string; title: string; description: string;
    points: number; required: boolean;
    link?: string; metadata?: Record<string, unknown>;
  }>;
  rewards: Array<{ type: string; label: string; symbol?: string; amount?: string }>;
}
export interface QuestSubmissionSummary {
  id: string; title: string; status: string;
  adminNote?: string; questId?: string; createdAt: string;
}
export interface QuestSubmission {
  id: string; submitterAddress: string;
  paymentTxHash: string; paymentChainId: number;
  title: string; description: string; projectName: string;
  projectUrl?: string; bannerUrl?: string;
  startDate: string; endDate: string; tags: string[];
  tasksJson: unknown; rewardsJson: unknown;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote?: string; reviewedBy?: string; reviewedAt?: string;
  questId?: string; createdAt: string;
}
export interface StakingSubmissionInput {
  paymentTxHash:      string;
  paymentChainId:     number;
  tokenAddress:       string;
  tokenSymbol:        string;
  tokenName:          string;
  tokenDecimals:      number;
  rewardTokenAddress: string;
  rewardTokenSymbol:  string;
  chainId:            number;
  apy:                number;
  lockDays:           number;
  minStake:           string;
  maxStake?:          string;
  poolStartDate:      string;
  poolEndDate:        string;
  totalRewardBudget:  string;
  description:        string;
  projectName:        string;
  projectUrl?:        string;
  logoUrl?:           string;
}
export interface StakingSubmissionSummary {
  id: string; projectName: string; tokenSymbol: string;
  status: string; adminNote?: string; createdAt: string;
}
export interface StakingSubmission {
  id: string; submitterAddress: string;
  paymentTxHash: string; paymentChainId: number;
  tokenAddress: string; tokenSymbol: string; tokenName: string;
  rewardTokenAddress: string; rewardTokenSymbol: string;
  chainId: number; apy: number; lockDays: number;
  minStake: string; maxStake?: string;
  poolStartDate: string; poolEndDate: string;
  totalRewardBudget: string; description: string;
  projectName: string; projectUrl?: string; logoUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote?: string; reviewedBy?: string; createdAt: string;
}
export interface PerpsSubmissionInput {
  paymentTxHash:       string;
  paymentChainId:      number;
  tokenAddress:        string;
  tokenSymbol:         string;
  tokenName:           string;
  quoteAsset:          "USDT" | "USDC";
  chainId:             number;
  oracleType:          "chainlink" | "pyth" | "custom";
  oracleAddress?:      string;
  maxLeverage:         number;
  tradingFeeBps:       number;
  liquidationFeeBps:   number;
  initialMarginBps:    number;
  maintenanceMarginBps: number;
  maxOILong:           string;
  maxOIShort:          string;
  initialLiquidity:    string;
  description:         string;
  projectName:         string;
  projectUrl?:         string;
  logoUrl?:            string;
}
export interface PerpsSubmissionSummary {
  id: string; projectName: string; tokenSymbol: string;
  maxLeverage: number; status: string; adminNote?: string; createdAt: string;
}
export interface PerpsSubmission {
  id: string; submitterAddress: string;
  paymentTxHash: string; paymentChainId: number;
  tokenAddress: string; tokenSymbol: string; tokenName: string;
  quoteAsset: string; chainId: number;
  oracleType: string; oracleAddress?: string;
  maxLeverage: number; tradingFeeBps: number; liquidationFeeBps: number;
  initialMarginBps: number; maintenanceMarginBps: number;
  maxOILong: string; maxOIShort: string; initialLiquidity: string;
  description: string; projectName: string; projectUrl?: string; logoUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote?: string; reviewedBy?: string; reviewedAt?: string; createdAt: string;
}
export interface Lock {
  id: string; lockType: string; tokenAddress: string; tokenSymbol?: string;
  token0Symbol?: string; token1Symbol?: string;
  amount: string; owner: string; unlockDate: string;
  withdrawn: boolean; chainId: number; txHash?: string;
  contractAddress?: string; // TokenLockerV1 contract address (on-chain locks)
}
