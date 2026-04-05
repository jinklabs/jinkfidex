"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitQuest = submitQuest;
exports.listSubmissions = listSubmissions;
exports.mySubmissions = mySubmissions;
exports.approveSubmission = approveSubmission;
exports.rejectSubmission = rejectSubmission;
exports.listQuests = listQuests;
exports.getQuest = getQuest;
exports.getLeaderboard = getLeaderboard;
exports.getUserProgress = getUserProgress;
exports.verifyTask = verifyTask;
const ethers_1 = require("ethers");
const db_1 = require("../config/db");
const redis_1 = require("../config/redis");
const env_1 = require("../config/env");
const errorHandler_1 = require("../middleware/errorHandler");
const zod_1 = require("zod");
// ── On-chain verification helpers ─────────────────────────────────────────────
const RPC_BY_CHAIN = {
    1: env_1.env.MAINNET_RPC_URL,
    8453: env_1.env.BASE_RPC_URL,
    4217: env_1.env.TEMPO_RPC_URL,
};
const NATIVE_SYMBOL_BY_CHAIN = {
    1: "ETH", 8453: "ETH", 42161: "ETH", 10: "ETH",
    4217: "USD",
};
async function verifyOnchainTx(txHash, userAddress, chainId = 4217) {
    const rpcUrl = RPC_BY_CHAIN[chainId] ?? env_1.env.TEMPO_RPC_URL;
    const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
    const [tx, receipt] = await Promise.all([
        provider.getTransaction(txHash),
        provider.getTransactionReceipt(txHash),
    ]);
    if (!tx)
        throw new errorHandler_1.AppError(400, "Transaction not found on-chain");
    if (!receipt)
        throw new errorHandler_1.AppError(400, "Transaction has no receipt — not yet mined");
    if (receipt.status !== 1)
        throw new errorHandler_1.AppError(400, "Transaction failed on-chain");
    if (tx.from.toLowerCase() !== userAddress.toLowerCase()) {
        throw new errorHandler_1.AppError(400, "Transaction was not sent by your wallet address");
    }
}
// ── Twitter verification helpers ───────────────────────────────────────────────
async function verifyTwitterFollow(targetHandle, userTwitterId) {
    if (!env_1.env.TWITTER_BEARER_TOKEN)
        return; // skip if not configured
    // Resolve target handle → user id
    const lookupRes = await fetch(`https://api.twitter.com/2/users/by/username/${targetHandle.replace("@", "")}`, { headers: { Authorization: `Bearer ${env_1.env.TWITTER_BEARER_TOKEN}` } });
    if (!lookupRes.ok)
        throw new errorHandler_1.AppError(502, "Twitter API error resolving target handle");
    const { data: target } = await lookupRes.json();
    if (!target?.id)
        throw new errorHandler_1.AppError(502, "Target Twitter user not found");
    // Check if user follows target
    const followRes = await fetch(`https://api.twitter.com/2/users/${userTwitterId}/following?target_user_id=${target.id}`, { headers: { Authorization: `Bearer ${env_1.env.TWITTER_BEARER_TOKEN}` } });
    if (!followRes.ok)
        throw new errorHandler_1.AppError(502, "Twitter API error checking follow status");
    const { data: following } = await followRes.json();
    if (!following?.some(f => f.id === target.id)) {
        throw new errorHandler_1.AppError(400, "You haven't followed the required Twitter account yet");
    }
}
async function verifyTwitterRetweet(tweetUrl, userTwitterId) {
    if (!env_1.env.TWITTER_BEARER_TOKEN)
        return;
    const match = tweetUrl.match(/\/status\/(\d+)/);
    if (!match)
        throw new errorHandler_1.AppError(400, "Invalid tweet URL in task link");
    const tweetId = match[1];
    // Paginate through retweeters (up to 1000) to find the user
    let paginationToken;
    for (let page = 0; page < 10; page++) {
        const url = new URL(`https://api.twitter.com/2/tweets/${tweetId}/retweeted_by`);
        url.searchParams.set("max_results", "100");
        if (paginationToken)
            url.searchParams.set("pagination_token", paginationToken);
        const res = await fetch(url.toString(), {
            headers: { Authorization: `Bearer ${env_1.env.TWITTER_BEARER_TOKEN}` },
        });
        if (!res.ok)
            throw new errorHandler_1.AppError(502, "Twitter API error checking retweet status");
        const body = await res.json();
        if (body.data?.some(u => u.id === userTwitterId))
            return; // found
        if (!body.meta?.next_token)
            break; // no more pages
        paginationToken = body.meta.next_token;
    }
    throw new errorHandler_1.AppError(400, "You haven't retweeted the required tweet yet");
}
// ── Discord verification helper ────────────────────────────────────────────────
async function verifyDiscordJoin(guildId, userDiscordId) {
    if (!env_1.env.DISCORD_BOT_TOKEN)
        return;
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userDiscordId}`, { headers: { Authorization: `Bot ${env_1.env.DISCORD_BOT_TOKEN}` } });
    if (res.status === 404) {
        throw new errorHandler_1.AppError(400, "You haven't joined the required Discord server yet");
    }
    if (!res.ok)
        throw new errorHandler_1.AppError(502, "Discord API error checking server membership");
}
const QUEST_FEE_WEI = BigInt(Math.round(parseFloat(env_1.env.QUEST_FEE_ETH) * 1e18));
// ── Quest Submissions ──────────────────────────────────────────────────────────
const submitQuestSchema = zod_1.z.object({
    paymentTxHash: zod_1.z.string().regex(/^0x[0-9a-fA-F]{64}$/),
    paymentChainId: zod_1.z.number().optional().default(4217),
    title: zod_1.z.string().min(3).max(120),
    description: zod_1.z.string().min(10).max(2000),
    projectName: zod_1.z.string().min(2).max(80),
    projectUrl: zod_1.z.string().url().optional(),
    bannerUrl: zod_1.z.string().url().optional(),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
    tags: zod_1.z.array(zod_1.z.string()).max(6).default([]),
    tasks: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.string(),
        title: zod_1.z.string().min(3).max(120),
        description: zod_1.z.string().max(500),
        points: zod_1.z.number().int().min(1).max(10000),
        required: zod_1.z.boolean().default(false),
        link: zod_1.z.string().url().optional(),
        metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    })).min(1).max(20),
    rewards: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.string(),
        label: zod_1.z.string(),
        symbol: zod_1.z.string().optional(),
        amount: zod_1.z.string().optional(),
    })).max(10).default([]),
});
// POST /api/quests/submit  (auth required)
async function submitQuest(req, res) {
    const body = submitQuestSchema.parse(req.body);
    // Verify payment on-chain
    const rpcUrl = RPC_BY_CHAIN[body.paymentChainId] ?? env_1.env.TEMPO_RPC_URL;
    const nativeSymbol = NATIVE_SYMBOL_BY_CHAIN[body.paymentChainId] ?? "USD";
    const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
    const [tx, receipt] = await Promise.all([
        provider.getTransaction(body.paymentTxHash),
        provider.getTransactionReceipt(body.paymentTxHash),
    ]);
    if (!tx)
        throw new errorHandler_1.AppError(400, "Payment transaction not found on-chain");
    if (!receipt || receipt.status !== 1)
        throw new errorHandler_1.AppError(400, "Payment transaction failed or not yet mined");
    if (tx.from.toLowerCase() !== req.user.address.toLowerCase())
        throw new errorHandler_1.AppError(400, "Payment must be sent from your connected wallet");
    if (!env_1.env.FEE_RECIPIENT_ADDRESS)
        throw new errorHandler_1.AppError(500, "Fee recipient not configured");
    if (tx.to?.toLowerCase() !== env_1.env.FEE_RECIPIENT_ADDRESS.toLowerCase())
        throw new errorHandler_1.AppError(400, "Payment was not sent to the correct fee address");
    if (tx.value < QUEST_FEE_WEI)
        throw new errorHandler_1.AppError(400, `Payment must be at least ${env_1.env.QUEST_FEE_ETH} ${nativeSymbol}`);
    // Prevent duplicate submissions for the same tx
    const duplicate = await db_1.prisma.questSubmission.findFirst({ where: { paymentTxHash: body.paymentTxHash } });
    if (duplicate)
        throw new errorHandler_1.AppError(409, "This transaction has already been used for a submission");
    const submission = await db_1.prisma.questSubmission.create({
        data: {
            submitterAddress: req.user.address,
            paymentTxHash: body.paymentTxHash,
            paymentChainId: body.paymentChainId,
            feePaid: env_1.env.QUEST_FEE_ETH,
            title: body.title,
            description: body.description,
            projectName: body.projectName,
            projectUrl: body.projectUrl,
            bannerUrl: body.bannerUrl,
            startDate: new Date(body.startDate),
            endDate: new Date(body.endDate),
            tags: body.tags,
            tasksJson: body.tasks,
            rewardsJson: body.rewards,
        },
    });
    res.status(201).json({ id: submission.id, status: submission.status });
}
// GET /api/quests/submissions  (admin only)
async function listSubmissions(req, res) {
    const { status } = req.query;
    const submissions = await db_1.prisma.questSubmission.findMany({
        where: status ? { status: status } : undefined,
        orderBy: { createdAt: "desc" },
    });
    res.json(submissions);
}
// GET /api/quests/submissions/mine  (auth required)
async function mySubmissions(req, res) {
    const submissions = await db_1.prisma.questSubmission.findMany({
        where: { submitterAddress: req.user.address },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, status: true, adminNote: true, questId: true, createdAt: true },
    });
    res.json(submissions);
}
const reviewSchema = zod_1.z.object({
    adminNote: zod_1.z.string().optional(),
});
// POST /api/quests/submissions/:subId/approve  (admin only)
async function approveSubmission(req, res) {
    const subId = String(req.params.subId);
    const { adminNote } = reviewSchema.parse(req.body);
    const sub = await db_1.prisma.questSubmission.findUnique({ where: { id: subId } });
    if (!sub)
        throw new errorHandler_1.AppError(404, "Submission not found");
    if (sub.status !== "PENDING")
        throw new errorHandler_1.AppError(409, "Submission already reviewed");
    const tasks = sub.tasksJson;
    const rewards = sub.rewardsJson;
    const quest = await db_1.prisma.$transaction(async (tx) => {
        const q = await tx.quest.create({
            data: {
                title: sub.title,
                description: sub.description,
                projectName: sub.projectName,
                projectLogo: sub.projectUrl ?? undefined,
                bannerUrl: sub.bannerUrl ?? undefined,
                startDate: sub.startDate,
                endDate: sub.endDate,
                tags: sub.tags,
                totalPoints: tasks.reduce((s, t) => s + Number(t.points ?? 0), 0),
                active: true,
                featured: false,
                tasks: {
                    create: tasks.map((t, i) => ({
                        type: String(t.type),
                        title: String(t.title),
                        description: String(t.description),
                        points: Number(t.points),
                        required: Boolean(t.required),
                        link: t.link ? String(t.link) : undefined,
                        metadata: t.metadata ?? undefined,
                        order: i,
                    })),
                },
                rewards: {
                    create: rewards.map(r => ({
                        type: String(r.type),
                        label: String(r.label),
                        symbol: r.symbol ? String(r.symbol) : undefined,
                        amount: r.amount ? String(r.amount) : undefined,
                    })),
                },
            },
        });
        await tx.questSubmission.update({
            where: { id: subId },
            data: { status: "APPROVED", adminNote, reviewedBy: req.user.address, reviewedAt: new Date(), questId: q.id },
        });
        return q;
    });
    await (0, redis_1.cacheDel)(redis_1.CacheKeys.quests());
    res.json({ questId: quest.id });
}
// POST /api/quests/submissions/:subId/reject  (admin only)
async function rejectSubmission(req, res) {
    const subId = String(req.params.subId);
    const { adminNote } = reviewSchema.parse(req.body);
    const sub = await db_1.prisma.questSubmission.findUnique({ where: { id: subId } });
    if (!sub)
        throw new errorHandler_1.AppError(404, "Submission not found");
    if (sub.status !== "PENDING")
        throw new errorHandler_1.AppError(409, "Submission already reviewed");
    await db_1.prisma.questSubmission.update({
        where: { id: subId },
        data: { status: "REJECTED", adminNote, reviewedBy: req.user.address, reviewedAt: new Date() },
    });
    res.json({ success: true });
}
// GET /api/quests
async function listQuests(req, res) {
    const cacheKey = redis_1.CacheKeys.quests();
    const cached = await (0, redis_1.cacheGet)(cacheKey);
    if (cached) {
        res.setHeader("X-Cache", "HIT");
        res.json(cached);
        return;
    }
    const quests = await db_1.prisma.quest.findMany({
        where: { active: true },
        include: {
            rewards: true,
            tasks: { select: { id: true, type: true, points: true, required: true, title: true }, orderBy: { order: "asc" } },
            _count: { select: { progress: true } },
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = quests.map((q) => ({
        ...q,
        totalParticipants: q._count?.progress ?? 0,
        totalPoints: q.tasks.reduce((s, t) => s + t.points, 0),
    }));
    await (0, redis_1.cacheSet)(cacheKey, result, env_1.env.CACHE_TTL_MEDIUM);
    res.json(result);
}
// GET /api/quests/:id
async function getQuest(req, res) {
    const id = String(req.params.id);
    const cacheKey = redis_1.CacheKeys.quest(id);
    const cached = await (0, redis_1.cacheGet)(cacheKey);
    if (cached) {
        res.setHeader("X-Cache", "HIT");
        res.json(cached);
        return;
    }
    const quest = await db_1.prisma.quest.findUnique({
        where: { id },
        include: {
            rewards: true,
            tasks: { orderBy: { order: "asc" } },
            _count: { select: { progress: true } },
        },
    });
    if (!quest)
        throw new errorHandler_1.AppError(404, "Quest not found");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = { ...quest, totalParticipants: quest._count?.progress ?? 0 };
    await (0, redis_1.cacheSet)(cacheKey, result, env_1.env.CACHE_TTL_MEDIUM);
    res.json(result);
}
// GET /api/quests/:id/leaderboard
async function getLeaderboard(req, res) {
    const id = String(req.params.id);
    const cacheKey = redis_1.CacheKeys.questLeaderboard(id);
    const cached = await (0, redis_1.cacheGet)(cacheKey);
    if (cached) {
        res.setHeader("X-Cache", "HIT");
        res.json(cached);
        return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const leaderboard = await db_1.prisma.questProgress.findMany({
        where: { questId: id },
        orderBy: { pointsEarned: "desc" },
        take: 100,
        include: {
            user: { select: { address: true, username: true } },
        },
    });
    const completionCounts = await db_1.prisma.taskCompletion.groupBy({
        by: ["userId"],
        where: {
            task: { questId: id },
        },
        _count: { taskId: true },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const countMap = Object.fromEntries(completionCounts.map((c) => [c.userId, c._count?.taskId ?? 0]));
    const result = leaderboard.map((entry, i) => ({
        rank: i + 1,
        address: entry.user?.address,
        username: entry.user?.username,
        points: entry.pointsEarned,
        tasksCompleted: countMap[entry.userId] ?? 0,
    }));
    await (0, redis_1.cacheSet)(cacheKey, result, env_1.env.CACHE_TTL_SHORT);
    res.json(result);
}
// GET /api/quests/:id/progress  (auth required)
async function getUserProgress(req, res) {
    const id = String(req.params.id);
    const progress = await db_1.prisma.questProgress.findUnique({
        where: { userId_questId: { userId: req.user.id, questId: id } },
    });
    const completions = await db_1.prisma.taskCompletion.findMany({
        where: { userId: req.user.id, task: { questId: id } },
        select: { taskId: true, completedAt: true },
    });
    res.json({ progress, completions });
}
const verifyTaskSchema = zod_1.z.object({
    answer: zod_1.z.string().optional(),
    txHash: zod_1.z.string().optional(),
    chainId: zod_1.z.number().optional(),
    twitterUserId: zod_1.z.string().optional(), // user's Twitter numeric ID
    discordUserId: zod_1.z.string().optional(), // user's Discord snowflake ID
});
// POST /api/quests/:id/tasks/:taskId/verify  (auth required)
async function verifyTask(req, res) {
    const questId = String(req.params.id);
    const taskId = String(req.params.taskId);
    const { answer, txHash, chainId = 1, twitterUserId, discordUserId } = verifyTaskSchema.parse(req.body);
    // Check already completed
    const existing = await db_1.prisma.taskCompletion.findUnique({
        where: { userId_taskId: { userId: req.user.id, taskId } },
    });
    if (existing)
        throw new errorHandler_1.AppError(409, "Task already completed");
    const task = await db_1.prisma.questTask.findFirst({
        where: { id: taskId, questId },
    });
    if (!task)
        throw new errorHandler_1.AppError(404, "Task not found");
    // ── Verify by task type ──────────────────────────────────────────────────
    if (task.type === "quiz") {
        const meta = task.metadata;
        if (!meta?.answer || answer !== meta.answer) {
            throw new errorHandler_1.AppError(400, "Incorrect answer");
        }
    }
    else if (task.type === "onchain") {
        if (!txHash)
            throw new errorHandler_1.AppError(400, "txHash is required for on-chain tasks");
        await verifyOnchainTx(txHash, req.user.address, chainId);
    }
    else if (task.type === "twitter_follow") {
        // If TWITTER_BEARER_TOKEN is configured and user provided their Twitter ID, verify
        if (env_1.env.TWITTER_BEARER_TOKEN && twitterUserId && task.link) {
            // Extract handle from link, e.g. https://x.com/JinkFi
            const handle = task.link.split("/").pop() ?? "";
            await verifyTwitterFollow(handle, twitterUserId);
        }
        // else: trust client (no API key configured or Twitter ID not linked)
    }
    else if (task.type === "twitter_retweet") {
        if (env_1.env.TWITTER_BEARER_TOKEN && twitterUserId && task.link) {
            await verifyTwitterRetweet(task.link, twitterUserId);
        }
        // else: trust client (no bearer token or Twitter ID not provided)
    }
    else if (task.type === "discord_join") {
        const meta = task.metadata;
        if (env_1.env.DISCORD_BOT_TOKEN && discordUserId && meta?.guildId) {
            await verifyDiscordJoin(meta.guildId, discordUserId);
        }
        // else: trust client (no bot token or guild ID not configured)
    }
    // Record completion
    await db_1.prisma.$transaction(async (tx) => {
        await tx.taskCompletion.create({
            data: { userId: req.user.id, taskId },
        });
        await tx.questProgress.upsert({
            where: { userId_questId: { userId: req.user.id, questId } },
            create: { userId: req.user.id, questId, pointsEarned: task.points },
            update: { pointsEarned: { increment: task.points } },
        });
    });
    // Bust caches
    await (0, redis_1.cacheDel)(redis_1.CacheKeys.questLeaderboard(questId));
    res.json({ success: true, pointsEarned: task.points });
}
//# sourceMappingURL=quest.controller.js.map