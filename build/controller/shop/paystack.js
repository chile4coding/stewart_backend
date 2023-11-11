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
exports.fundWallet = exports.verifyPayment = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const paystack_1 = __importDefault(require("paystack"));
const express_validator_1 = require("express-validator");
const http_status_codes_1 = require("http-status-codes");
const helpers_1 = require("../../helpers");
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_client_1 = __importDefault(require("../../configuration/prisma-client"));
const Paystack = (0, paystack_1.default)(process.env.paystackAuthization + "");
dotenv_1.default.config();
exports.verifyPayment = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { reference } = req.query;
    try {
        if (!Boolean(reference)) {
            (0, helpers_1.throwError)("Invalid Input", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const verifyPay = yield ((_a = Paystack === null || Paystack === void 0 ? void 0 : Paystack.transaction) === null || _a === void 0 ? void 0 : _a.verify(reference));
        if ((verifyPay === null || verifyPay === void 0 ? void 0 : verifyPay.data.status) === "success") {
            const amount = Number(verifyPay.data.amount);
            const amountN = Number((amount / 100).toFixed(2));
            const walletAmount = yield prisma_client_1.default.wallet.findUnique({
                where: { transactionref: reference },
            });
            const oldAmount = Number(walletAmount === null || walletAmount === void 0 ? void 0 : walletAmount.amount);
            const currentAmount = oldAmount + amountN;
            yield prisma_client_1.default.wallet.update({
                where: { id: walletAmount === null || walletAmount === void 0 ? void 0 : walletAmount.id },
                data: {
                    amount: currentAmount,
                },
            });
            res.redirect("https://stewart-frontend-chile4coding.vercel.app/my_account");
        }
        else {
            (0, helpers_1.throwError)("payment failed", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.fundWallet = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const errors = (0, express_validator_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid input valid  ", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    const { email, amount, name } = req.body;
    const { authId } = req;
    function generateUniqueReferenceNumber() {
        const timestamp = Date.now();
        const randomNumber = Math.random().toString().slice(2);
        const referenceNumber = `${timestamp}${randomNumber}`;
        return referenceNumber;
    }
    try {
        const initPayment = yield Paystack.transaction.initialize({
            name: name,
            amount: Number(amount) * 100,
            email: email,
            reference: `${generateUniqueReferenceNumber()}`,
            callback_url: "http://localhost:5000/api/v1/verify_payment",
            authorization: `Bearer ${process.env.paystackAuthization}`,
        });
        console.log(initPayment);
        yield prisma_client_1.default.wallet.update({
            where: { user_id: authId },
            data: {
                transactionref: (_b = initPayment === null || initPayment === void 0 ? void 0 : initPayment.data) === null || _b === void 0 ? void 0 : _b.reference,
            },
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            data: initPayment.data.authorization_url,
        });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
