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
exports.verifyPayment = exports.paystack = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const http_status_codes_1 = require("http-status-codes");
const helpers_1 = require("../../helpers");
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_client_1 = __importDefault(require("../../configuration/prisma-client"));
dotenv_1.default.config();
exports.paystack = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Inavlid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    const { email, amount, userId, order, name, state, city, address, country, phone, } = req.body;
    const https = require("https");
    const params = JSON.stringify({
        email: email,
        amount: `${Number(amount) * 100}`,
    });
    const options = {
        hostname: process.env.paystackHostname,
        port: process.env.paystackPort,
        path: process.env.paystackPath,
        method: process.env.paystackMethod,
        headers: {
            Authorization: process.env.paystackAuthization,
            "Content-Type": "application/json",
        },
    };
    const reqPaystack = https
        .request(options, (resPaystack) => {
        let data = "";
        resPaystack.on("data", (chunk) => {
            data += chunk;
        });
        resPaystack.on("end", () => __awaiter(void 0, void 0, void 0, function* () {
            const finalData = JSON.parse(data);
            const { authorization_url, reference } = finalData.data;
            let newOrder;
            if (Boolean(userId)) {
                newOrder = yield prisma_client_1.default.order.create({
                    data: {
                        refNo: reference,
                        orderitem: JSON.stringify(order),
                        total: amount,
                        tax: 4,
                        shipping: 50,
                        phone,
                        city,
                        address,
                        country,
                        name,
                        state,
                        arrivalDate: `${new Date().getDate() + 4}`,
                        user: { connect: { id: userId } },
                    },
                });
            }
            else {
                newOrder = yield prisma_client_1.default.order.create({
                    data: {
                        refNo: reference,
                        orderitem: order,
                        total: Number(amount),
                        tax: 4.0,
                        shipping: 50.0,
                        phone,
                        city,
                        address,
                        country,
                        name,
                        state,
                        arrivalDate: `${new Date().getDate() + 4}`,
                    },
                });
            }
            res.status(http_status_codes_1.StatusCodes.OK).json({
                data: {
                    authorization_url,
                    newOrder,
                },
            });
        }));
    })
        .on("error", (error) => {
        console.error(error);
    });
    reqPaystack.write(params);
    reqPaystack.end();
}));
exports.verifyPayment = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const reference = req.query.reference;
    const https = require("https");
    const options = {
        hostname: "api.paystack.co",
        port: 443,
        path: `/transaction/verify/:${reference}`,
        method: "GET",
        headers: {
            Authorization: "Bearer SECRET_KEY",
        },
    };
    https
        .request(options, (resPaystack) => {
        let data = "";
        res.on("data", (chunk) => {
            data += chunk;
        });
        const finalData = JSON.parse(data);
        const { status, reference } = finalData.data;
        res.on("end", () => __awaiter(void 0, void 0, void 0, function* () {
            let confirmOrder;
            confirmOrder = yield prisma_client_1.default.order.findFirst({
                where: {
                    refNo: reference,
                },
            });
            if (confirmOrder && confirmOrder.status === "success") {
                confirmOrder = yield prisma_client_1.default.order.update({
                    where: { id: confirmOrder.id },
                    data: {
                        status: status,
                    },
                });
            }
            res.status(http_status_codes_1.StatusCodes.OK).json({
                finalData,
                confirmOrder,
            });
        }));
    })
        .on("error", (error) => {
        console.error(error);
    });
}));
