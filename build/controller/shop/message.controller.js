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
exports.deleteMessage = exports.getMessages = void 0;
const http_status_codes_1 = require("http-status-codes");
const helpers_1 = require("../../helpers");
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_client_1 = __importDefault(require("../../configuration/prisma-client"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
dotenv_1.default.config();
exports.getMessages = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authId } = req;
    try {
        const inbox = yield prisma_client_1.default.inbox.findMany({
            where: { user_id: authId },
        });
        res.send(http_status_codes_1.StatusCodes.OK).json({
            message: "Messages successfullly fetched",
            inbox,
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.deleteMessage = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const message = yield prisma_client_1.default.inbox.delete({
            where: {
                id: id,
            },
        });
        if (!message) {
            (0, helpers_1.throwError)("Error deleting message", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Message deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
}));
