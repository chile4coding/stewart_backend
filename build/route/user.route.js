"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../middleware/auth"));
const user_controller_1 = require("../controller/users/user.controller");
const express_validator_1 = require("express-validator");
const order_controller_1 = require("../controller/shop/order.controller");
const router = (0, express_1.Router)();
router.post("/signup", [
    (0, express_validator_1.body)("name").notEmpty(),
    (0, express_validator_1.body)("password").notEmpty(),
    (0, express_validator_1.body)("email").isEmail(),
    (0, express_validator_1.body)("gender").notEmpty(),
    (0, express_validator_1.body)("dob").isEmail(),
], user_controller_1.createUser);
router.post("/verify_otp", [(0, express_validator_1.body)("otp").notEmpty()], user_controller_1.verifyOtp);
router.post("/request_otp", [(0, express_validator_1.body)("email").isEmail()], user_controller_1.requestOtp);
router.post("/reset_password", [(0, express_validator_1.body)("email").isEmail(), (0, express_validator_1.body)("password").notEmpty()], user_controller_1.resetPassword);
router.post("/login_user", [(0, express_validator_1.body)("password").notEmpty(), (0, express_validator_1.body)("email").isEmail()], user_controller_1.loginUser);
router.post("/fund_wallet", [(0, express_validator_1.body)("status").notEmpty(), (0, express_validator_1.body)("amount").notEmpty()], user_controller_1.fundWallet);
router.post("/pay_with_wallet", auth_1.default, [
    (0, express_validator_1.body)("email").notEmpty(),
    (0, express_validator_1.body)("total").notEmpty(),
    (0, express_validator_1.body)("name").notEmpty(),
    (0, express_validator_1.body)("state").notEmpty(),
    (0, express_validator_1.body)("city").notEmpty(),
    (0, express_validator_1.body)("address").notEmpty(),
    (0, express_validator_1.body)("country").notEmpty(),
    (0, express_validator_1.body)("status").notEmpty(),
    (0, express_validator_1.body)("shipping").notEmpty(),
    (0, express_validator_1.body)("phone").notEmpty(),
    (0, express_validator_1.body)("shippingType").notEmpty(),
], order_controller_1.payOrderWithWallet);
router.get("/get_user", auth_1.default, user_controller_1.getUser);
exports.userRouter = router;
