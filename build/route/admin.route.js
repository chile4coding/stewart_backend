"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoute = void 0;
const express_1 = require("express");
const product_controller_admin_1 = require("../controller/admin/product.controller.admin");
const admin_controller_1 = require("../controller/admin/admin.controller");
const express_validator_1 = require("express-validator");
const auth_1 = __importDefault(require("../middleware/auth"));
const message_controller_1 = require("../controller/shop/message.controller");
const order_controller_1 = require("../controller/shop/order.controller");
const router = (0, express_1.Router)();
router.post("/create_admin", [(0, express_validator_1.check)("email").isEmail().isEmpty(), (0, express_validator_1.check)("password").isEmpty()], admin_controller_1.createAdmin);
router.post("/login_admin", [(0, express_validator_1.check)("email").isEmail().isEmpty(), (0, express_validator_1.check)("password").isEmpty()], admin_controller_1.loginAdmin);
router.post("/create_category", [(0, express_validator_1.check)("name").isEmpty(), (0, express_validator_1.check)("productImage")], auth_1.default, product_controller_admin_1.createCategory);
router.post("/create_product", auth_1.default, product_controller_admin_1.createOrUpdateProduct);
router.post("/create_size", auth_1.default, product_controller_admin_1.createOrUpdateSize);
router.post("/create_cloth_color", auth_1.default, product_controller_admin_1.createOrUpdateClothColor);
router.delete("/delete_product", [(0, express_validator_1.body)("productId").isEmpty()], auth_1.default, product_controller_admin_1.removeAProduct);
router.delete("/delete_color", [(0, express_validator_1.body)("productColorId").isEmpty()], auth_1.default, product_controller_admin_1.removeAProductColor);
router.post("/create_cloth_color", auth_1.default, product_controller_admin_1.createOrUpdateClothColor);
router.post("/create_message", auth_1.default, message_controller_1.sendMessage);
router.get("/get_messages", auth_1.default, message_controller_1.getMessages);
router.delete("/messages", auth_1.default, message_controller_1.deleteMessage);
router.delete("/notification", auth_1.default, message_controller_1.deleteNotification);
router.get("/get_notification", auth_1.default, message_controller_1.getNotifications);
router.get("/admin_get_message", auth_1.default, message_controller_1.adminMessage);
router.get("/admin_get_orders", auth_1.default, order_controller_1.getAdminOrder);
router.get("/admin_get_reviews", auth_1.default, order_controller_1.getAdminReviews);
router.get("/get_customers", auth_1.default, admin_controller_1.adminGetAllUsers);
router.get("/get_visitors", auth_1.default, admin_controller_1.getVistors);
router.delete("/delete_visitors", product_controller_admin_1.deletekVisitor);
router.post("/visitor", product_controller_admin_1.checkVisitor);
router.get("/admin_graph", auth_1.default, admin_controller_1.adminGraph);
router.post("/update_admin_profile", [
    (0, express_validator_1.check)("email").isEmail().isEmpty(),
    (0, express_validator_1.check)("password").isEmpty(),
    (0, express_validator_1.check)("firstName").isEmpty(),
    (0, express_validator_1.check)("lastName").isEmpty(),
    (0, express_validator_1.check)("city").isEmpty(),
    (0, express_validator_1.check)("country").isEmpty(),
    (0, express_validator_1.check)("state").isEmpty(),
    (0, express_validator_1.check)("phone").isEmpty(),
], auth_1.default, admin_controller_1.updateAdminProfile);
router.post("/update_admin_profile_pics", [(0, express_validator_1.check)("avatar").isEmpty()], auth_1.default, admin_controller_1.updateAdminProfilePics);
router.get("/get_admin", auth_1.default, admin_controller_1.getAdminProfile);
router.post("/contact", admin_controller_1.contactUsMessage);
exports.adminRoute = router;
