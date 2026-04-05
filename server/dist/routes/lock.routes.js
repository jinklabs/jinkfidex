"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lock_controller_1 = require("../controllers/lock.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/", lock_controller_1.listLocks);
router.get("/:id", lock_controller_1.getLock);
router.post("/", auth_1.requireAuth, lock_controller_1.createLock);
router.patch("/:id/withdraw", auth_1.requireAuth, lock_controller_1.markWithdrawn);
exports.default = router;
//# sourceMappingURL=lock.routes.js.map