"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/nonce/:address", auth_controller_1.getNonce);
router.post("/verify", auth_controller_1.verifySignature);
router.get("/me", auth_1.requireAuth, auth_controller_1.getMe);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map