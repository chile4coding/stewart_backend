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
exports.fundWallet = exports.loginUser = exports.createUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const http_status_codes_1 = require("http-status-codes");
const helpers_1 = require("../../helpers");
const prisma_client_1 = __importDefault(require("../../configuration/prisma-client"));
exports.createUser = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    try {
        const { name, password, email, gender, dob } = req.body;
        const findUser = yield prisma_client_1.default.user.findUnique({
            where: {
                email: email,
            },
        });
        if (findUser) {
            (0, helpers_1.throwError)("User Already exist", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const hashedPassword = yield (0, helpers_1.hashPassword)(password);
        const user = yield prisma_client_1.default.user.create({
            data: {
                name: name,
                passwords: hashedPassword,
                email: email,
                gender: gender,
                dob: dob,
            },
        });
        yield prisma_client_1.default.wallet.create({
            data: {
                amount: 0.0,
                user: { connect: { id: user.id } },
            },
        });
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            message: "Admin registrartion successful",
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.loginUser = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req.body);
    if (errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    try {
        const { password, email } = req.body;
        const findUser = yield prisma_client_1.default.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!findUser) {
            (0, helpers_1.throwError)("User not hregistered", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        yield (0, helpers_1.comparePassword)(password, findUser === null || findUser === void 0 ? void 0 : findUser.passwords);
        const token = (0, helpers_1.JWTToken)(findUser === null || findUser === void 0 ? void 0 : findUser.email, findUser === null || findUser === void 0 ? void 0 : findUser.id, findUser === null || findUser === void 0 ? void 0 : findUser.passwords);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Welcome toStewart Collections",
            token: token,
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.fundWallet = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid Input", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    const authId = req.authId;
    try {
        const { status, amount } = req.body;
        if (status !== "success") {
            (0, helpers_1.throwError)("error in payment", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const walletAmount = yield prisma_client_1.default.wallet.findUnique({
            where: {
                user_id: authId,
            },
        });
        const amountUpdate = (walletAmount === null || walletAmount === void 0 ? void 0 : walletAmount.amount) + amount;
        const newWallet = yield prisma_client_1.default.wallet.update({
            where: { id: walletAmount === null || walletAmount === void 0 ? void 0 : walletAmount.id },
            data: {
                amount: amountUpdate,
            },
        });
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json({ message: "Wallet funded successfully", wallet: newWallet });
    }
    catch (error) {
        next(error);
    }
}));
