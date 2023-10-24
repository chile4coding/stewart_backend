"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paystackRoute = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
// import { param } from "express-validator";
const paystack_1 = require("../controller/shop/paystack");
// import auth from "../middleware/auth";
const router = (0, express_1.Router)();
router.post("/create_payment", [(0, express_validator_1.check)("email").isEmail().isEmpty(), (0, express_validator_1.check)("amount").isEmpty()], paystack_1.paystack);
exports.paystackRoute = router;
