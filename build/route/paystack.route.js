"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paystackRoute = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const paystack_1 = require("../controller/shop/paystack");
const auth_1 = __importDefault(require("../middleware/auth"));
// import { param } from "express-validator";
// import { paystack } from "../controller/shop/paystack";
// import auth from "../middleware/auth";
const router = (0, express_1.Router)();
router.post("/fund_wallet", [
    (0, express_validator_1.check)("email").isEmail().notEmpty(),
    (0, express_validator_1.body)("amount").notEmpty(),
    (0, express_validator_1.body)("name").notEmpty(),
], auth_1.default, paystack_1.fundWallet);
router.get("/verify_payment", paystack_1.verifyPayment);
exports.paystackRoute = router;
