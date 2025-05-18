"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monifyRoute = void 0;
const express_1 = require("express");
const paystack_1 = require("../controller/shop/paystack");
const router = (0, express_1.Router)();
router.post("/confirm-monify-order-payment", paystack_1.confirmOrder);
exports.monifyRoute = router;
