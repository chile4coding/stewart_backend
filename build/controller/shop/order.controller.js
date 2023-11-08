"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payOrderWithWallet = exports.getUserOrder = exports.getAllOrder = exports.getOrder = exports.registeredUserCreateOrder = exports.visitorCreateOrder = void 0;
const http_status_codes_1 = require("http-status-codes");
const helpers_1 = require("../../helpers");
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_client_1 = __importDefault(require("../../configuration/prisma-client"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
dotenv_1.default.config();
exports.visitorCreateOrder = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, total, orderitem, name, state, city, address, status, country, shipping, phone, shippingType, refNo, } = req.body;
    const currentDate = new Date();
    const arrivalDate = shippingType === "express"
        ? currentDate.setDate(currentDate.getDate() + 4)
        : currentDate.setDate(currentDate.getDate() + 7);
    try {
        const visitorOrder = yield prisma_client_1.default.order.create({
            data: {
                email,
                total,
                orderitem,
                name,
                state,
                city,
                address,
                status,
                country,
                shipping,
                phone,
                shippingType,
                refNo,
                arrivalDate: currentDate + "",
            },
        });
        const content = `<p> Your order has been  received please. </p> <p> Track your order with the id</p>  <p> Tracking id:  <h2> ${visitorOrder.id}  </h2> </p>   <br> <p>Enter the your tracking Id  to the link you clicked on below  </p> <br> 
      <a href="https://stewart-frontend-chile4coding.vercel.app/"   >Click to track your order</a>
      `;
        const subject = "Your Order Status";
        if (visitorOrder.status === "SUCCESS" ||
            visitorOrder.status === "PAY ON DELIVERY") {
            const mail = yield (0, helpers_1.sendEmail)(content, visitorOrder === null || visitorOrder === void 0 ? void 0 : visitorOrder.email, subject);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Order placed successfully",
                visitorOrder,
            });
        }
        else {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                message: "Your Order was not successful",
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.registeredUserCreateOrder = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, total, orderitem, name, state, city, address, country, status, shipping, phone, shippingType, refNo, } = req.body;
    const { authId } = req;
    const currentDate = new Date();
    const arrivalDate = shippingType === "express"
        ? currentDate.setDate(currentDate.getDate() + 4)
        : currentDate.setDate(currentDate.getDate() + 7);
    try {
        const visitorOrder = yield prisma_client_1.default.order.create({
            data: {
                email,
                total,
                orderitem,
                name,
                state,
                city,
                address,
                status,
                country,
                shipping,
                phone,
                shippingType,
                user: { connect: { id: authId } },
                refNo,
                arrivalDate: currentDate + "",
            },
        });
        const content = `<p> Your order has been  received please. </p> <p> Track your order with the id</p>  <p> Tracking id:  <h2> ${visitorOrder.id}  </h2> </p>   <br> <p>Enter the your tracking Id  to the link you clicked on below  </p> <br> 
      <a href="https://stewart-frontend-chile4coding.vercel.app/"   >Click to track your order</a>
      `;
        const subject = "Your Order Status";
        if (visitorOrder.status === "SUCCESS" ||
            visitorOrder.status === "PAY ON DELIVERY") {
            const mail = yield (0, helpers_1.sendEmail)(content, visitorOrder === null || visitorOrder === void 0 ? void 0 : visitorOrder.email, subject);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Order placed successfully",
                visitorOrder,
            });
        }
        else {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                message: "Your Order was not successful",
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.getOrder = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.body;
    try {
        const order = yield prisma_client_1.default.order.findUnique({ where: { id: orderId } });
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json({ message: "Order has been fetched successfully", order });
    }
    catch (error) {
        next(error);
    }
}));
exports.getAllOrder = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authId } = req;
    try {
        const findAdmin = yield prisma_client_1.default.admin.findUnique({
            where: { id: authId },
        });
        if (!findAdmin) {
            (0, helpers_1.throwError)("Invalid admin user", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const order = yield prisma_client_1.default.order.findMany();
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json({ message: "Order has been fetched successfully", order });
    }
    catch (error) {
        next(error);
    }
}));
exports.getUserOrder = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authId } = req;
    try {
        const order = yield prisma_client_1.default.order.findMany({
            where: {
                id: authId,
            },
        });
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json({ message: "Order has been fetched successfully", order });
    }
    catch (error) {
        next(error);
    }
}));
exports.payOrderWithWallet = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid Input", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    const { authId } = req;
    const { email, total, orderitem, name, state, city, address, country, status, shipping, phone, shippingType, } = req.body;
    try {
        const userWallet = yield prisma_client_1.default.wallet.findUnique({
            where: { user_id: authId },
        });
        if (!userWallet) {
            (0, helpers_1.throwError)("Invalid user", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const availableAmount = Number(userWallet === null || userWallet === void 0 ? void 0 : userWallet.amount);
        if (availableAmount < 500) {
            (0, helpers_1.throwError)("Insufficient wallet balance, fund your wallet", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        if (availableAmount < Number(total)) {
            (0, helpers_1.throwError)("Insufficient wallet balance, fund your wallet", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const order = yield prisma_client_1.default.order.create({
            data: {
                email,
                total,
                orderitem,
                name,
                state,
                city,
                address,
                country,
                status,
                shipping,
                phone,
                shippingType,
                refNo: authId,
                user: { connect: { id: authId } },
            },
        });
        const updateWallet = yield prisma_client_1.default.wallet.update({
            where: { id: userWallet === null || userWallet === void 0 ? void 0 : userWallet.id },
            data: {
                amount: availableAmount - Number(total),
            },
        });
        console.log(updateWallet);
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json({ message: "Order successfully placed", order });
    }
    catch (error) {
        next(error);
    }
}));
