"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const farm_controller_1 = require("../controllers/farm.controller");
const router = (0, express_1.Router)();
router.get("/", farm_controller_1.listFarms);
exports.default = router;
//# sourceMappingURL=farm.routes.js.map