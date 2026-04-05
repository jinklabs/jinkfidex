"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitPerps = submitPerps;
exports.listPerpsSubmissions = listPerpsSubmissions;
exports.myPerpsSubmissions = myPerpsSubmissions;
exports.approvePerpsSubmission = approvePerpsSubmission;
exports.rejectPerpsSubmission = rejectPerpsSubmission;
const ethers_1 = require("ethers");
const db_1 = require("../config/db");
const env_1 = require("../config/env");
const errorHandler_1 = require("../middleware/errorHandler");
const zod_1 = require("zod");
const RPC_BY_CHAIN = {
    1: env_1.env.MAINNET_RPC_URL,
    8453: env_1.env.BASE_RPC_URL,
};
const PERPS_FEE_WEI = BigInt(Math.round(parseFloat(env_1.env.QUEST_FEE_ETH) * 1e18));
const submitSchema = zod_1.z.object({
    paymentTxHash: zod_1.z.string().regex(/^0x[0-9a-fA-F]{64}$/),
    paymentChainId: zod_1.z.number().optional().default(1),
    tokenAddress: zod_1.z.string().regex(/^0x[0-9a-fA-F]{40}$/),
    tokenSymbol: zod_1.z.string().min(1).max(20),
    tokenName: zod_1.z.string().min(1).max(80),
    quoteAsset: zod_1.z.enum(["USDT", "USDC"]).default("USDT"),
    chainId: zod_1.z.number().optional().default(1),
    oracleType: zod_1.z.enum(["chainlink", "pyth", "custom"]).default("chainlink"),
    oracleAddress: zod_1.z.string().regex(/^0x[0-9a-fA-F]{40}$/).optional(),
    maxLeverage: zod_1.z.number().int().min(2).max(500).default(100),
    tradingFeeBps: zod_1.z.number().int().min(1).max(500).default(10),
    liquidationFeeBps: zod_1.z.number().int().min(10).max(1000).default(100),
    initialMarginBps: zod_1.z.number().int().min(10).max(10000).default(100),
    maintenanceMarginBps: zod_1.z.number().int().min(5).max(5000).default(50),
    maxOILong: zod_1.z.string().min(1).default("1000000"),
    maxOIShort: zod_1.z.string().min(1).default("1000000"),
    initialLiquidity: zod_1.z.string().default("0"),
    description: zod_1.z.string().min(10).max(2000),
    projectName: zod_1.z.string().min(2).max(80),
    projectUrl: zod_1.z.string().url().optional(),
    logoUrl: zod_1.z.string().url().optional(),
});
const reviewSchema = zod_1.z.object({ adminNote: zod_1.z.string().optional() });
// POST /api/perps/submit
async function submitPerps(req, res) {
    const body = submitSchema.parse(req.body);
    const rpcUrl = RPC_BY_CHAIN[body.paymentChainId] ?? env_1.env.MAINNET_RPC_URL;
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
        throw new errorHandler_1.AppError(400, "Payment not sent to correct fee address");
    if (tx.value < PERPS_FEE_WEI)
        throw new errorHandler_1.AppError(400, `Payment must be at least ${env_1.env.QUEST_FEE_ETH} ETH`);
    const duplicate = await db_1.prisma.perpsSubmission.findFirst({ where: { paymentTxHash: body.paymentTxHash } });
    if (duplicate)
        throw new errorHandler_1.AppError(409, "Transaction already used for a submission");
    const submission = await db_1.prisma.perpsSubmission.create({
        data: {
            submitterAddress: req.user.address,
            paymentTxHash: body.paymentTxHash,
            paymentChainId: body.paymentChainId,
            feePaid: env_1.env.QUEST_FEE_ETH,
            tokenAddress: body.tokenAddress,
            tokenSymbol: body.tokenSymbol,
            tokenName: body.tokenName,
            quoteAsset: body.quoteAsset,
            chainId: body.chainId,
            oracleType: body.oracleType,
            oracleAddress: body.oracleAddress,
            maxLeverage: body.maxLeverage,
            tradingFeeBps: body.tradingFeeBps,
            liquidationFeeBps: body.liquidationFeeBps,
            initialMarginBps: body.initialMarginBps,
            maintenanceMarginBps: body.maintenanceMarginBps,
            maxOILong: body.maxOILong,
            maxOIShort: body.maxOIShort,
            initialLiquidity: body.initialLiquidity,
            description: body.description,
            projectName: body.projectName,
            projectUrl: body.projectUrl,
            logoUrl: body.logoUrl,
        },
    });
    res.status(201).json({ id: submission.id, status: submission.status });
}
// GET /api/perps/submissions
async function listPerpsSubmissions(req, res) {
    const { status } = req.query;
    const submissions = await db_1.prisma.perpsSubmission.findMany({
        where: status ? { status: status } : undefined,
        orderBy: { createdAt: "desc" },
    });
    res.json(submissions);
}
// GET /api/perps/submissions/mine
async function myPerpsSubmissions(req, res) {
    const submissions = await db_1.prisma.perpsSubmission.findMany({
        where: { submitterAddress: req.user.address },
        orderBy: { createdAt: "desc" },
        select: { id: true, projectName: true, tokenSymbol: true, maxLeverage: true, status: true, adminNote: true, createdAt: true },
    });
    res.json(submissions);
}
// POST /api/perps/submissions/:id/approve
async function approvePerpsSubmission(req, res) {
    const id = String(req.params.id);
    const { adminNote } = reviewSchema.parse(req.body);
    const sub = await db_1.prisma.perpsSubmission.findUnique({ where: { id } });
    if (!sub)
        throw new errorHandler_1.AppError(404, "Submission not found");
    if (sub.status !== "PENDING")
        throw new errorHandler_1.AppError(409, "Already reviewed");
    await db_1.prisma.perpsSubmission.update({
        where: { id },
        data: { status: "APPROVED", adminNote, reviewedBy: req.user.address, reviewedAt: new Date() },
    });
    res.json({ success: true });
}
// POST /api/perps/submissions/:id/reject
async function rejectPerpsSubmission(req, res) {
    const id = String(req.params.id);
    const { adminNote } = reviewSchema.parse(req.body);
    const sub = await db_1.prisma.perpsSubmission.findUnique({ where: { id } });
    if (!sub)
        throw new errorHandler_1.AppError(404, "Submission not found");
    if (sub.status !== "PENDING")
        throw new errorHandler_1.AppError(409, "Already reviewed");
    await db_1.prisma.perpsSubmission.update({
        where: { id },
        data: { status: "REJECTED", adminNote, reviewedBy: req.user.address, reviewedAt: new Date() },
    });
    res.json({ success: true });
}
//# sourceMappingURL=perps.controller.js.map