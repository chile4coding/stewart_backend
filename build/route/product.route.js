"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoute = void 0;
const express_1 = require("express");
// import { param } from "express-validator";
const product_controller_admin_1 = require("../controller/admin/product.controller.admin");
// import auth from "../middleware/auth";
const router = (0, express_1.Router)();
router.get("/get_products", product_controller_admin_1.getProduct);
router.get("/get_category", product_controller_admin_1.getCategory);
router.get("/get_sizes", product_controller_admin_1.getSizes);
router.get("/get_color", product_controller_admin_1.getColors);
exports.productRoute = router;
