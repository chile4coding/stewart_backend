"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoute = void 0;
const express_1 = require("express");
// import { param } from "express-validator";
const product_controller_admin_1 = require("../controller/admin/product.controller.admin");
// import auth from "../middleware/auth";
const order_controller_1 = require("../controller/shop/order.controller");
const auth_1 = __importDefault(require("../middleware/auth"));
const reviews_1 = require("../controller/shop/reviews");
const router = (0, express_1.Router)();
router.get("/get_products", product_controller_admin_1.getProduct);
router.get("/get_category", product_controller_admin_1.getCategory);
router.get("/get_sizes", product_controller_admin_1.getSizes);
router.get("/get_color", product_controller_admin_1.getColors);
router.post("/create_order_vistor", order_controller_1.visitorCreateOrder);
router.post("/get_track_order", order_controller_1.getOrder);
router.post("/get_all_order", auth_1.default, order_controller_1.getAllOrder);
router.post("/get_user_order", auth_1.default, order_controller_1.getUserOrder);
router.post("/create_order_user", auth_1.default, order_controller_1.registeredUserCreateOrder);
router.post("/create_order_user_with_card", auth_1.default, order_controller_1.createOrderWithCard);
router.post("/create_order_visitor_with_card", order_controller_1.createOrderWithCard);
router.post("/update_review", auth_1.default, reviews_1.updateReview);
router.get("/product/:id", product_controller_admin_1.getSingleProduct);
// ?addmin get items
exports.productRoute = router;
