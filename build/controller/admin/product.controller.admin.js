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
exports.getColors = exports.getSizes = exports.getProduct = exports.getCategory = exports.createOrUpdateClothColor = exports.createOrUpdateSize = exports.createOrUpdateProduct = exports.createCategory = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const helpers_1 = require("../../helpers");
const http_status_codes_1 = require("http-status-codes");
const prisma_client_1 = __importDefault(require("../../configuration/prisma-client"));
exports.createCategory = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const errors = (0, express_validator_1.validationResult)(req.params);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    const authId = req.authId;
    try {
        if ("file" in req) {
            if (!req.path) {
                (0, helpers_1.throwError)("file is requiered", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
            }
            const { name } = req.params;
            const admin = yield prisma_client_1.default.admin.findUnique({
                where: {
                    id: authId,
                },
            });
            console.log("get the admon user ====================", admin);
            if (!admin) {
                (0, helpers_1.throwError)("Invalid admin user", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
            }
            const { url: image_url } = yield (0, helpers_1.uploadImage)((_a = req.file) === null || _a === void 0 ? void 0 : _a.path);
            console.log("this is the image url =====================", image_url);
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
                        image: image_url,
                    },
                });
                console.log("update product category=====================", productCategory);
            }
            else {
                productCategory = yield prisma_client_1.default.category.create({
                    data: {
                        name: name,
                        image: image_url,
                    },
                });
            }
            console.log("created product categhory=====================", productCategory);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                productCategory,
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.createOrUpdateProduct = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const errors = (0, express_validator_1.validationResult)(req.params);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    const { categoryId, name, price, discount, initialSize, initialColor, description, productId, salesPrice, } = req.params;
    const authId = req.authId;
    try {
        if ("file" in req) {
            if (!req.path) {
                (0, helpers_1.throwError)("file is requiered", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
            }
            const subscriberPrice = Number((price - Number(price) * (Number(discount) / 100)).toFixed(2));
            const admin = yield prisma_client_1.default.admin.findUnique({
                where: {
                    id: authId,
                },
            });
            if (!admin) {
                (0, helpers_1.throwError)("Invalid admin user", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
            }
            const { url: image_url } = yield (0, helpers_1.uploadImage)((_b = req.file) === null || _b === void 0 ? void 0 : _b.path);
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
    const { name, productId } = req.params;
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
                product: {
                    connect: { id: productId },
                },
            },
        });
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            message: "product added successfully",
            size,
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.createOrUpdateClothColor = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const errors = (0, express_validator_1.validationResult)(req.params);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    const authId = req.authId;
    try {
        if ("file" in req) {
            if (!req.path) {
                (0, helpers_1.throwError)("file is requiered", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
            }
            const { name, price, discount, colorId, sizeId, sales_price } = req.params;
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
            const { url: image_url } = yield (0, helpers_1.uploadImage)((_c = req.file) === null || _c === void 0 ? void 0 : _c.path);
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
