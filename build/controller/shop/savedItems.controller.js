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
exports.saveItem = exports.deleteSavedItem = exports.getSavedItems = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = require("http-status-codes");
const helpers_1 = require("../../helpers");
const prisma_client_1 = __importDefault(require("../../configuration/prisma-client"));
exports.getSavedItems = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authId } = req;
    try {
        const savedItems = yield prisma_client_1.default.saveItem.findMany({
            where: { user_id: authId },
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            savedItems,
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.deleteSavedItem = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    try {
        const savedItem = yield prisma_client_1.default.saveItem.delete({
            where: {
                id: id,
            },
        });
        if (!savedItem) {
            (0, helpers_1.throwError)("Error deleting saved item", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Saved item deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.saveItem = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    function convertFalseToBoolean(value) {
        if (typeof value === "string" && value === "false" || value === "undefined" || value === undefined) {
            return false;
        }
        else {
            return Boolean(value);
        }
    }
    const { authId } = req;
    const { name, image, amount, id, status } = req.body;
    try {
        if (convertFalseToBoolean(status)) {
            const savedItem = yield prisma_client_1.default.saveItem.deleteMany({
                where: { item_id: id, user_id: authId },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                savedItem,
            });
        }
        else {
            const saved = yield prisma_client_1.default.saveItem.create({
                data: {
                    name: name,
                    image: image,
                    amount: amount,
                    status: convertFalseToBoolean(status),
                    user: { connect: { id: authId } },
                    item_id: id,
                },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json({
                saved,
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
