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
const savedItems_controller_1 = require("../controller/shop/savedItems.controller");
const message_controller_1 = require("../controller/shop/message.controller");
const reviews_1 = require("../controller/shop/reviews");
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
router.post("/update_user_profile", auth_1.default, [
    (0, express_validator_1.body)("email").notEmpty(),
    (0, express_validator_1.body)("name").notEmpty(),
    (0, express_validator_1.body)("state").notEmpty(),
    (0, express_validator_1.body)("city").notEmpty(),
    (0, express_validator_1.body)("address").notEmpty(),
    (0, express_validator_1.body)("country").notEmpty(),
    (0, express_validator_1.body)("phone").notEmpty(),
], user_controller_1.updateProfile);
router.post("/update_user_pics", auth_1.default, user_controller_1.uploadUserProfilePics);
router.get("/get_user", auth_1.default, user_controller_1.getUser);
router.get("/get_saved_items", auth_1.default, savedItems_controller_1.getSavedItems);
router.delete("/delete_saved_item", auth_1.default, savedItems_controller_1.deleteSavedItem);
router.get("/get_messages", auth_1.default, message_controller_1.getMessages);
router.delete("/delete_messages", auth_1.default, message_controller_1.deleteMessage);
router.get("/get_reviews", auth_1.default, reviews_1.getReviews);
router.delete("/delete_review", auth_1.default, reviews_1.deleteReviews);
router.post("/add_review", auth_1.default, [
    (0, express_validator_1.body)("rating").notEmpty(),
    (0, express_validator_1.body)("name").notEmpty(),
    (0, express_validator_1.body)("comment").notEmpty(),
    (0, express_validator_1.body)("productId").notEmpty(),
], reviews_1.addreview);
router.post("/save_item", auth_1.default, [
    (0, express_validator_1.body)("name").notEmpty(),
    (0, express_validator_1.body)("image").notEmpty(),
    (0, express_validator_1.body)("id").notEmpty(),
    (0, express_validator_1.body)("status").notEmpty(),
    (0, express_validator_1.body)("amount").notEmpty(),
], savedItems_controller_1.saveItem);
exports.userRouter = router;
