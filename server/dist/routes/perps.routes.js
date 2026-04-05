"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const perps_controller_1 = require("../controllers/perps.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/submit", auth_1.requireAuth, perps_controller_1.submitPerps);
router.get("/submissions/mine", auth_1.requireAuth, perps_controller_1.myPerpsSubmissions);
router.get("/submissions", auth_1.requireAdmin, perps_controller_1.listPerpsSubmissions);
router.post("/submissions/:id/approve", auth_1.requireAdmin, perps_controller_1.approvePerpsSubmission);
router.post("/submissions/:id/reject", auth_1.requireAdmin, perps_controller_1.rejectPerpsSubmission);
exports.default = router;
//# sourceMappingURL=perps.routes.js.map