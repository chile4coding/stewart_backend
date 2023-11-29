"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_route_1 = require("./admin.route");
const product_route_1 = require("./product.route");
const paystack_route_1 = require("./paystack.route");
const user_route_1 = require("./user.route");
const router = (0, express_1.Router)();
router.use("/api/v1", admin_route_1.adminRoute);
router.use("/api/v1", product_route_1.productRoute);
router.use("/api/v1", paystack_route_1.paystackRoute);
router.use("/api/v1", user_route_1.userRouter);
exports.default = router;
