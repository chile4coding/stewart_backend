"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const helpers_1 = require("../helpers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.default = (req, res, next) => {
    try {
        const authHeader = req.get("Authorization");
        console.log("This is the heqder  =========================== ", authHeader);
        if (!authHeader) {
            (0, helpers_1.throwError)("No token provided", http_status_codes_1.StatusCodes.UNAUTHORIZED);
        }
        let decode;
        const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
        decode = jsonwebtoken_1.default.verify(token, `${process.env.JWT_SECRET_KEY}`);
        console.log("This is the decoded   =========================== ", decode);
        if (!token || !decode) {
            (0, helpers_1.throwError)("Invalid token", http_status_codes_1.StatusCodes.UNAUTHORIZED);
        }
        req.authId = decode.authId;
        req.role = decode.role;
        next();
    }
    catch (error) {
        const errorResponse = new Error("Not authorized");
        errorResponse.statusCode = http_status_codes_1.StatusCodes.UNAUTHORIZED;
        next(errorResponse);
    }
};
