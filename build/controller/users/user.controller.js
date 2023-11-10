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
exports.getUser = exports.fundWallet = exports.updateProfile = exports.loginUser = exports.resetPassword = exports.requestOtp = exports.verifyOtp = exports.createUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const http_status_codes_1 = require("http-status-codes");
const helpers_1 = require("../../helpers");
const prisma_client_1 = __importDefault(require("../../configuration/prisma-client"));
const node_cron_1 = __importDefault(require("node-cron"));
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
        const { token, secret } = yield (0, helpers_1.reqTwoFactorAuth)();
        const hashedPassword = yield (0, helpers_1.hashPassword)(password);
        const user = yield prisma_client_1.default.user.create({
            data: {
                name: name,
                passwords: hashedPassword,
                email: email,
                gender: gender,
                verify_otp: false,
                dob: dob,
                otp_trial: token,
                otp_secret: secret.base32,
            },
        });
        const content = `<p>Click the link below and enter your OTP to verify your registeration</p> <div><a href="https://stewart-frontend-chile4coding.vercel.app/otp">click</a></div><h2>${token}</h2>`;
        const subject = "Stewart Collections OTP Registration";
        yield (0, helpers_1.sendEmail)(content, user === null || user === void 0 ? void 0 : user.email, subject);
        yield prisma_client_1.default.wallet.create({
            data: {
                amount: 0.0,
                user: { connect: { id: user.id } },
            },
        });
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            message: "Registration successful",
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.verifyOtp = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    try {
        const { otp } = req.body;
        const otpExist = yield prisma_client_1.default.user.findUnique({
            where: { otp_trial: otp },
        });
        console.log(otpExist === null || otpExist === void 0 ? void 0 : otpExist.otp_secret, otp);
        if ((otpExist === null || otpExist === void 0 ? void 0 : otpExist.otp) === otp) {
            (0, helpers_1.throwError)("OTP has been used ", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const isvalid = yield (0, helpers_1.verifyTwoFactorAuth)(otp, otpExist === null || otpExist === void 0 ? void 0 : otpExist.otp_secret);
        if (!isvalid) {
            (0, helpers_1.throwError)("Invalid Otp", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const findUser = yield prisma_client_1.default.user.update({
            where: { otp_trial: otp },
            data: {
                otp: otp,
                verify_otp: true,
            },
        });
        if (!findUser) {
            (0, helpers_1.throwError)("Invalid OTP supplied", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "OTP verified successfully",
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.requestOtp = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    try {
        const { email } = req.body;
        const findUser = yield prisma_client_1.default.user.findUnique({ where: { email: email } });
        if (!findUser) {
            (0, helpers_1.throwError)("user not found", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const { token, secret } = yield (0, helpers_1.reqTwoFactorAuth)();
        const userOtpupdate = yield prisma_client_1.default.user.update({
            where: { email: findUser === null || findUser === void 0 ? void 0 : findUser.email },
            data: {
                otp_secret: secret.base32,
                otp_trial: token,
                verify_otp: false,
            },
        });
        if (!userOtpupdate) {
            (0, helpers_1.throwError)("user not found", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const content = `<p>Click the link below and enter your OTP to verify your OTP</p> <div><a href="https://stewart-frontend-chile4coding.vercel.app/otp?">click</a></div><h2>${token}</h2>`;
        const subject = "Stewart Collections OTP Request";
        yield (0, helpers_1.sendEmail)(content, findUser === null || findUser === void 0 ? void 0 : findUser.email, subject);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "OTP sent",
            token,
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.resetPassword = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    try {
        const { email, password } = req.body;
        const findUser = yield prisma_client_1.default.user.findUnique({ where: { email: email } });
        if (!findUser) {
            (0, helpers_1.throwError)("user not found", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        if (!(findUser === null || findUser === void 0 ? void 0 : findUser.verify_otp)) {
            (0, helpers_1.throwError)("OTP not verified, verify OTP", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const hashedPassword = yield (0, helpers_1.hashPassword)(password);
        const reset = yield prisma_client_1.default.user.update({
            where: { email: findUser === null || findUser === void 0 ? void 0 : findUser.email },
            data: {
                passwords: hashedPassword,
            },
        });
        if (reset) {
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Password Changed",
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.loginUser = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    try {
        const { password, email } = req.body;
        const findUser = yield prisma_client_1.default.user.findUnique({
            where: {
                email: email,
            },
            include: {
                wallet: true,
                orders: true,
                review: true,
                inbox: true,
                save_items: true,
            },
        });
        if (!findUser) {
            (0, helpers_1.throwError)("User not registered", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        yield (0, helpers_1.comparePassword)(password, findUser === null || findUser === void 0 ? void 0 : findUser.passwords);
        const token = (0, helpers_1.JWTToken)(findUser === null || findUser === void 0 ? void 0 : findUser.email, findUser === null || findUser === void 0 ? void 0 : findUser.id, "user");
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Welcome to Stewart Collections",
            token: token,
            findUser,
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.updateProfile = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    try {
        const { password, email, name, phone, country, state, city, address } = req.body;
        const findUser = yield prisma_client_1.default.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!findUser) {
            (0, helpers_1.throwError)("User not registered", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        yield (0, helpers_1.comparePassword)(password, findUser === null || findUser === void 0 ? void 0 : findUser.passwords);
        const updateUser = yield prisma_client_1.default.user.update({
            where: { email: findUser === null || findUser === void 0 ? void 0 : findUser.email },
            data: {
                email,
                name,
                phone,
                country,
                state,
                address,
                city,
            },
        });
        if (!updateUser) {
            (0, helpers_1.throwError)("Server error", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Welcome to Stewart Collections",
            updateUser,
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
        if (status !== "SUCCESS") {
            (0, helpers_1.throwError)("error in payment", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const walletAmount = yield prisma_client_1.default.wallet.findUnique({
            where: {
                user_id: authId,
            },
        });
        const amountUpdate = Number(walletAmount === null || walletAmount === void 0 ? void 0 : walletAmount.amount) + Number(amount);
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
exports.getUser = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid Input", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    const authId = req.authId;
    try {
        const user = yield prisma_client_1.default.user.findUnique({
            where: { id: authId },
            include: {
                wallet: true,
                orders: true,
                review: true,
                inbox: true,
                save_items: true,
            },
        });
        if (!user) {
            (0, helpers_1.throwError)("User not found", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "user logged in successfully",
            user,
        });
    }
    catch (error) {
        next(error);
    }
}));
node_cron_1.default.schedule(' 1 * *  * * * ', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("hello this is nice");
}));
