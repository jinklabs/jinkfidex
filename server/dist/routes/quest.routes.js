"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quest_controller_1 = require("../controllers/quest.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public
router.get("/", quest_controller_1.listQuests);
router.get("/:id", quest_controller_1.getQuest);
router.get("/:id/leaderboard", quest_controller_1.getLeaderboard);
// Auth required
router.get("/:id/progress", auth_1.requireAuth, quest_controller_1.getUserProgress);
router.post("/:id/tasks/:taskId/verify", auth_1.requireAuth, quest_controller_1.verifyTask);
router.post("/submit", auth_1.requireAuth, quest_controller_1.submitQuest);
router.get("/submissions/mine", auth_1.requireAuth, quest_controller_1.mySubmissions);
// Admin only
router.get("/submissions", auth_1.requireAdmin, quest_controller_1.listSubmissions);
router.post("/submissions/:subId/approve", auth_1.requireAdmin, quest_controller_1.approveSubmission);
router.post("/submissions/:subId/reject", auth_1.requireAdmin, quest_controller_1.rejectSubmission);
exports.default = router;
//# sourceMappingURL=quest.routes.js.map