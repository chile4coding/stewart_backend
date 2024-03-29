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
exports.adminMessage = exports.sendMessage = exports.deleteNotification = exports.deleteMessage = exports.getNotifications = exports.getMessages = void 0;
const http_status_codes_1 = require("http-status-codes");
const helpers_1 = require("../../helpers");
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_client_1 = __importDefault(require("../../configuration/prisma-client"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const server_1 = require("../../server/server");
dotenv_1.default.config();
exports.getMessages = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authId } = req;
    try {
        const inbox = yield prisma_client_1.default.inbox.findMany({
            where: { user_id: authId },
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Messages successfullly fetched",
            inbox,
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.getNotifications = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authId } = req;
    try {
        const inbox = yield prisma_client_1.default.notifications.findMany({
            where: { user_id: authId },
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Notifications successfullly fetched",
            inbox,
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.deleteMessage = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const message = yield prisma_client_1.default.inbox.delete({
            where: {
                id: id,
            },
        });
        if (!message) {
            (0, helpers_1.throwError)("Error deleting message", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        server_1.socket.emit("new-message");
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Message deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.deleteNotification = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const message = yield prisma_client_1.default.notifications.delete({
            where: {
                id: id,
            },
        });
        if (!message) {
            (0, helpers_1.throwError)("Error deleting notification", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "notification deleted deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.sendMessage = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authId } = req;
    const { title, message } = req.body;
    try {
        const admin = yield prisma_client_1.default.admin.findUnique({ where: { id: authId } });
        if (!admin) {
            (0, helpers_1.throwError)("Unauthorized Admin", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const customers = yield prisma_client_1.default.user.findMany();
        function createMessage(title, message, id) {
            return __awaiter(this, void 0, void 0, function* () {
                yield prisma_client_1.default.inbox.create({
                    data: {
                        title,
                        message,
                        user: { connect: { id: id } },
                        date: `${new Date().toLocaleDateString("en-UK")}`,
                    },
                });
                yield prisma_client_1.default.notifications.create({
                    data: {
                        notification: "New message received",
                        link: "/message",
                        user: { connect: { id: id } },
                        date: `${new Date().getTime()}`,
                    },
                });
            });
        }
        for (const user of customers) {
            createMessage(title, message, user.id);
        }
        server_1.socket.emit("new-message");
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Message sent",
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.adminMessage = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authId } = req;
    try {
        const admin = yield prisma_client_1.default.admin.findUnique({ where: { id: authId } });
        if (!admin) {
            (0, helpers_1.throwError)("Unauthorized Admin", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const messages = yield prisma_client_1.default.inbox.findMany();
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Message  fetched successfully",
            messages,
        });
    }
    catch (error) {
        next(error);
    }
}));
