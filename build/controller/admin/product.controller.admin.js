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
exports.removeAProductColor = exports.removeAProduct = exports.getColors = exports.getSizes = exports.getProduct = exports.getCategory = exports.createOrUpdateClothColor = exports.createOrUpdateSize = exports.createOrUpdateProduct = exports.createCategory = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const helpers_1 = require("../../helpers");
const http_status_codes_1 = require("http-status-codes");
const prisma_client_1 = __importDefault(require("../../configuration/prisma-client"));
exports.createCategory = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    const authId = req.authId;
    try {
        const { name, productImage } = req.body;
        const admin = yield prisma_client_1.default.admin.findUnique({
            where: {
                id: authId,
            },
        });
        if (!admin) {
            (0, helpers_1.throwError)("Invalid admin user", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        let productCategory;
        productCategory = yield prisma_client_1.default.category.findFirst({
            where: {
                name: name,
            },
        });
        if (productCategory) {
            yield prisma_client_1.default.category.update({
                where: {
                    id: productCategory.id,
                },
                data: {
                    name: name,
                    image: productImage,
                },
            });
        }
        else {
            productCategory = yield prisma_client_1.default.category.create({
                data: {
                    name: name,
                    image: productImage,
                },
            });
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({
            productCategory,
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.createOrUpdateProduct = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId, name, price, discount, initialSize, initialColor, description, productId, salesPrice, image_url, short_desc, } = req.body;
    const authId = req.authId;
    try {
        const subscriberPrice = Number((price - Number(price) * (Number(discount) / 100)).toFixed(2));
        const admin = yield prisma_client_1.default.admin.findUnique({
            where: {
                id: authId,
            },
        });
        if (!admin) {
            (0, helpers_1.throwError)("Invalid admin user", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const productCategory = yield prisma_client_1.default.category.findUnique({
            where: {
                id: categoryId,
            },
        });
        let product;
        if (productId.length > 5) {
            product = yield prisma_client_1.default.product.findUnique({
                where: {
                    id: productId,
                },
            });
            if (!product) {
                (0, helpers_1.throwError)("product not found", http_status_codes_1.StatusCodes.BAD_GATEWAY, true);
            }
            const p = Number(Number(price).toFixed(2));
            const pr = parseFloat(p.toFixed(2));
            product = yield prisma_client_1.default.product.update({
                where: { id: productId },
                data: {
                    name: name,
                    price: pr,
                    short_desc: short_desc,
                    initial_color: initialColor,
                    initial_size: initialSize,
                    description: description,
                    categoryName: productCategory === null || productCategory === void 0 ? void 0 : productCategory.name,
                    category_id: categoryId,
                    sales_price: Number(salesPrice),
                    discount: parseFloat(Number(discount).toFixed(2)),
                    subscriber_price: parseFloat(subscriberPrice.toFixed(2)),
                    image: image_url,
                },
            });
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                message: "product added successfully",
                product,
            });
        }
        else {
            product = yield prisma_client_1.default.product.create({
                data: {
                    category_id: categoryId,
                    name: name,
                    price: Number(Number(price).toFixed(2)),
                    initial_color: initialColor,
                    short_desc: short_desc,
                    initial_size: initialSize,
                    description: description,
                    categoryName: productCategory === null || productCategory === void 0 ? void 0 : productCategory.name,
                    sales_price: Number(salesPrice),
                    discount: parseFloat(Number(discount).toFixed(2)),
                    subscriber_price: parseFloat(subscriberPrice.toFixed(2)),
                    image: image_url,
                },
            });
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                message: "product added successfully",
                product,
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.createOrUpdateSize = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req.params);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    const authId = req.authId;
    const { name, productId, waist, length, sleaves } = req.body;
    try {
        const admin = yield prisma_client_1.default.admin.findUnique({
            where: {
                id: authId,
            },
        });
        if (!admin) {
            (0, helpers_1.throwError)("Invalid admin user", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const size = yield prisma_client_1.default.size.create({
            data: {
                name: name,
                waist: waist,
                length: length,
                sleaves: sleaves,
                product: { connect: { id: productId } },
            },
        });
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            message: "product size added successfully",
            size,
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.createOrUpdateClothColor = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authId = req.authId;
    try {
        const { name, price, discount, colorId, sizeId, sales_price, image_url } = req.body;
        const subscriberPrice = Number((price - Number(price) * (Number(discount) / 100)).toFixed(2));
        const admin = yield prisma_client_1.default.admin.findUnique({
            where: {
                id: authId,
            },
        });
        if (!admin) {
            (0, helpers_1.throwError)("Invalid admin user", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const p = Number(Number(price).toFixed(2));
        const pr = parseFloat(p.toFixed(2));
        console.log(colorId);
        let color;
        if (colorId.trim().length > 2) {
            color = yield prisma_client_1.default.color.findUnique({
                where: {
                    id: colorId,
                },
            });
            if (!color) {
                (0, helpers_1.throwError)("color not found", http_status_codes_1.StatusCodes.BAD_GATEWAY, true);
            }
            color = yield prisma_client_1.default.color.update({
                where: { id: colorId },
                data: {
                    name: name,
                    price: pr,
                    sales_price: Number(sales_price),
                    size_id: sizeId,
                    discount: parseFloat(Number(discount).toFixed(2)),
                    subscriber_price: parseFloat(subscriberPrice.toFixed(2)),
                    image: image_url,
                },
            });
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                message: "product added successfully",
                color,
            });
        }
        else {
            color = yield prisma_client_1.default.color.create({
                data: {
                    name: name,
                    price: pr,
                    sales_price: Number(sales_price),
                    size: { connect: { id: sizeId } },
                    discount: parseFloat(Number(discount).toFixed(2)),
                    subscriber_price: parseFloat(subscriberPrice.toFixed(2)),
                    image: image_url,
                },
            });
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                message: "product added successfully",
                color,
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.getCategory = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield prisma_client_1.default.category.findMany({
            include: {
                product: {
                    include: {
                        size: {
                            include: {
                                colors: true,
                            },
                        },
                    },
                },
            },
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            category,
        });
    }
    catch (err) {
        next(err);
    }
}));
exports.getProduct = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield prisma_client_1.default.product.findMany({
            include: {
                reviews: {
                    include: {
                        user: true
                    }
                },
                size: {
                    include: {
                        colors: true,
                    },
                },
            },
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            products,
        });
    }
    catch (err) {
        next(err);
    }
}));
exports.getSizes = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sizes = yield prisma_client_1.default.size.findMany({
            include: {
                colors: true,
            },
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            sizes,
        });
    }
    catch (err) {
        next(err);
    }
}));
exports.getColors = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const colors = yield prisma_client_1.default.color.findMany();
        res.status(http_status_codes_1.StatusCodes.OK).json({
            colors,
        });
    }
    catch (err) {
        next(err);
    }
}));
exports.removeAProduct = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    const authId = req.authId;
    const { productId } = req.body;
    try {
        const admin = yield prisma_client_1.default.admin.findUnique({ where: { id: authId } });
        if (!admin) {
            (0, helpers_1.throwError)("Unauthorized usser", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const deleteProduct = yield prisma_client_1.default.product.delete({
            where: { id: productId },
        });
        if (!deleteProduct) {
            (0, helpers_1.throwError)("Error deleting product", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "product deleted successfully",
        });
    }
    catch (err) {
        next(err);
    }
}));
exports.removeAProductColor = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    const authId = req.authId;
    const { productColorId } = req.body;
    try {
        const admin = yield prisma_client_1.default.admin.findUnique({ where: { id: authId } });
        if (!admin) {
            (0, helpers_1.throwError)("Unauthorized usser", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const deleteProduct = yield prisma_client_1.default.color.delete({
            where: { id: productColorId },
        });
        if (!deleteProduct) {
            (0, helpers_1.throwError)("Error deleting product", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "product deleted successfully",
        });
    }
    catch (err) {
        next(err);
    }
}));
