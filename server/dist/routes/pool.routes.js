"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pool_controller_1 = require("../controllers/pool.controller");
const router = (0, express_1.Router)();
router.get("/", pool_controller_1.listPools);
router.get("/:address", pool_controller_1.getPool);
router.post("/", pool_controller_1.upsertPool);
exports.default = router;
//# sourceMappingURL=pool.routes.js.map