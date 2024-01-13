"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReview = exports.deleteReviews = exports.getReviews = exports.addreview = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const http_status_codes_1 = require("http-status-codes");
const helpers_1 = require("../../helpers");
const prisma_client_1 = __importDefault(require("../../configuration/prisma-client"));
exports.addreview = (0, express_async_handler_1.default)(async (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    const authId = req.authId;
    try {
        const { rating, name, comment, productId } = req.body;
        // fetch hthe revie
        // check the user and the product Id if they are the same
        // update the review field
        // but if they are not the same then u need to create a new review
        const review = await prisma_client_1.default.review.findMany({
            where: { product_id: productId },
        });
        let check = false;
        review.forEach((item) => {
            if (item.user_id === authId && item.product_id === productId) {
                check = true;
            }
        });
        const user = await prisma_client_1.default.user.findUnique({
            where: {
                id: authId,
            },
        });
        if (!user) {
            (0, helpers_1.throwError)("Unauthorizded user", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        let userReview;
        if (!check) {
            userReview = await prisma_client_1.default.review.create({
                data: {
                    rating,
                    name: name,
                    comment: comment,
                    is_verified: Boolean(user?.is_varified),
                    avatar: user?.avatar || " ",
                    date: `${new Date().toLocaleString("en-US")}`,
                    product: { connect: { id: productId } },
                    user: { connect: { id: user?.id } },
                },
            });
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                messsage: "Review submitted successfully",
                review: userReview,
            });
        }
        else {
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                messsage: "Please go to review page to update review",
            });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.getReviews = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { authId } = req;
    try {
        const reviews = await prisma_client_1.default.review.findMany({
            where: {
                user_id: authId,
            },
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Reviews fetched successfully",
            reviews,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteReviews = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.body;
    try {
        const reviews = await prisma_client_1.default.review.delete({
            where: {
                id,
            },
        });
        if (!reviews) {
            (0, helpers_1.throwError)("Error deleting review", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: " Review deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateReview = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { rating, comment, id } = req.body;
    try {
        const review = await prisma_client_1.default.review.update({
            where: { id: id },
            data: {
                rating,
                comment,
            },
        });
        if (!review) {
            (0, helpers_1.throwError)("Error updating review", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Review updated successfully",
            review,
        });
    }
    catch (error) {
        next(error);
    }
});
