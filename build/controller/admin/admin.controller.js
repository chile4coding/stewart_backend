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
exports.loginAdmin = exports.createAdmin = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const prisma_client_1 = __importDefault(require("../../configuration/prisma-client"));
const validation_result_1 = require("express-validator/src/validation-result");
const http_status_codes_1 = require("http-status-codes");
const helpers_1 = require("../../helpers");
exports.createAdmin = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, validation_result_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    try {
        const { email, password } = req.body;
        const findAdmin = yield prisma_client_1.default.admin.findUnique({
            where: {
                email,
            },
        });
        if (findAdmin) {
            (0, helpers_1.throwError)("Admin Already registered", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const checkMoreThanOneAdmin = yield prisma_client_1.default.admin.findMany();
        console.log(checkMoreThanOneAdmin);
        if (checkMoreThanOneAdmin.length >= 1) {
            (0, helpers_1.throwError)("Stewart Collect can not allow multiple admin", http_status_codes_1.StatusCodes.BAD_GATEWAY, true);
        }
        const hashedPassword = yield (0, helpers_1.hashPassword)(password);
        const admin = yield prisma_client_1.default.admin.create({
            data: { email, password: hashedPassword },
        });
        if (!admin) {
            (0, helpers_1.throwError)("Server Error", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            message: "Admin registrartion successful",
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.loginAdmin = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, validation_result_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    try {
        const { email, password } = req.body;
        const findAdmin = yield prisma_client_1.default.admin.findUnique({
            where: {
                email,
            },
        });
        if (!findAdmin) {
            (0, helpers_1.throwError)("Admin user not found, wrong email entered", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        yield (0, helpers_1.comparePassword)(password, findAdmin === null || findAdmin === void 0 ? void 0 : findAdmin.password);
        const token = (0, helpers_1.JWTToken)(findAdmin === null || findAdmin === void 0 ? void 0 : findAdmin.email, findAdmin === null || findAdmin === void 0 ? void 0 : findAdmin.id, findAdmin === null || findAdmin === void 0 ? void 0 : findAdmin.password);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Welcome to Stewart Collections",
            token,
        });
    }
    catch (error) {
        next(error);
    }
}));
