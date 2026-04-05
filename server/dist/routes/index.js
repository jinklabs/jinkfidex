"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const quest_routes_1 = __importDefault(require("./quest.routes"));
const pool_routes_1 = __importDefault(require("./pool.routes"));
const farm_routes_1 = __importDefault(require("./farm.routes"));
const lock_routes_1 = __importDefault(require("./lock.routes"));
const staking_routes_1 = __importDefault(require("./staking.routes"));
const perps_routes_1 = __importDefault(require("./perps.routes"));
const router = (0, express_1.Router)();
router.use("/auth", auth_routes_1.default);
router.use("/quests", quest_routes_1.default);
router.use("/pools", pool_routes_1.default);
router.use("/farms", farm_routes_1.default);
router.use("/locks", lock_routes_1.default);
router.use("/staking", staking_routes_1.default);
router.use("/perps", perps_routes_1.default);
router.get("/health", (_, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
exports.default = router;
//# sourceMappingURL=index.js.map