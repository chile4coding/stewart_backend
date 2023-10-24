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
exports.addreview = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const http_status_codes_1 = require("http-status-codes");
const helpers_1 = require("../../helpers");
const prisma_client_1 = __importDefault(require("../../configuration/prisma-client"));
exports.addreview = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    const authId = req.authId;
    try {
        const { rating, name, comment, productId } = req.body;
        const user = yield prisma_client_1.default.user.findUnique({
            where: {
                id: authId,
            },
        });
        if (!user) {
            (0, helpers_1.throwError)("Unauthorizded user", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const rate = Number(rating);
        const userReview = yield prisma_client_1.default.review.create({
            data: {
                rating: rate,
                name: name,
                comment: comment,
                is_verified: Boolean(user === null || user === void 0 ? void 0 : user.is_varified),
                avatar: user === null || user === void 0 ? void 0 : user.avatar,
                date: new Date(),
                product: { connect: { id: productId } },
                user: { connect: { id: user === null || user === void 0 ? void 0 : user.id } },
            },
        });
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            review: userReview,
        });
    }
    catch (error) {
        next(error);
    }
}));
