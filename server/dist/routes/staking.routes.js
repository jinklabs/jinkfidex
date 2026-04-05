"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const staking_controller_1 = require("../controllers/staking.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/submit", auth_1.requireAuth, staking_controller_1.submitStaking);
router.get("/submissions/mine", auth_1.requireAuth, staking_controller_1.myStakingSubmissions);
router.get("/submissions", auth_1.requireAdmin, staking_controller_1.listStakingSubmissions);
router.post("/submissions/:id/approve", auth_1.requireAdmin, staking_controller_1.approveStakingSubmission);
router.post("/submissions/:id/reject", auth_1.requireAdmin, staking_controller_1.rejectStakingSubmission);
exports.default = router;
//# sourceMappingURL=staking.routes.js.map