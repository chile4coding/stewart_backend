"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTwoFactorAuth = exports.reqTwoFactorAuth = exports.sendEmail = exports.uploadImage = exports.isPrismaError = exports.comparePassword = exports.JWTToken = exports.hashPassword = exports.salt = exports.throwError = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const cloudinary_1 = require("cloudinary");
const nodemailer_1 = require("nodemailer");
dotenv_1.default.config();
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_codes_1 = require("http-status-codes");
const client_1 = require("@prisma/client");
const speakeasy_1 = __importDefault(require("speakeasy"));
const throwError = (errorMsg, statusCode, validationError) => {
    const error = new Error(errorMsg);
    error.statusCode = statusCode;
    error.validationError = validationError;
    throw error;
};
exports.throwError = throwError;
const salt = async () => await bcrypt_1.default.genSalt(10);
exports.salt = salt;
const hashPassword = async (password) => {
    const hashPassword = await bcrypt_1.default.hash(password, await (0, exports.salt)());
    return hashPassword;
};
exports.hashPassword = hashPassword;
const JWTToken = (email, userId, role) => {
    const token = jsonwebtoken_1.default.sign({
        email: email,
        authId: userId,
        role: role,
    }, `${process.env.JWT_SECRET_KEY}`, { expiresIn: "30d" });
    return token;
};
exports.JWTToken = JWTToken;
const comparePassword = async (password, hashedPassword) => {
    try {
        const isMatch = await bcrypt_1.default.compare(password, hashedPassword);
        if (!isMatch) {
            (0, exports.throwError)("Invalid password", http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
    }
    catch (error) {
        console.error(error);
        (0, exports.throwError)("Invalid password", http_status_codes_1.StatusCodes.BAD_REQUEST);
    }
};
exports.comparePassword = comparePassword;
function isPrismaError(error) {
    return (error instanceof client_1.Prisma.PrismaClientKnownRequestError ||
        error instanceof client_1.Prisma.PrismaClientUnknownRequestError);
}
exports.isPrismaError = isPrismaError;
const uploadImage = async function name(file) {
    const result = await cloudinary_1.v2.uploader.upload(file, {
        folder: process.env.CLOUDINARY_UPLOAD_PATH,
    });
    return result;
};
exports.uploadImage = uploadImage;
const sendEmail = async function (content, to, subject) {
    const mailOption = {
        from: process.env.EMAIL,
        to: to,
        subject: subject,
        html: content,
    };
    try {
        const transport = (0, nodemailer_1.createTransport)({
            host: "mail.privateemail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.MAIL_PASSWORD,
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false,
            },
        });
        const info = await transport.sendMail(mailOption);
        return info;
    }
    catch (error) {
        console.log(error);
    }
};
exports.sendEmail = sendEmail;
async function reqTwoFactorAuth() {
    const secret = speakeasy_1.default.generateSecret({ length: 10 });
    const token = speakeasy_1.default.totp({
        secret: secret.base32,
        encoding: "base32",
        step: 240
    });
    return { token, secret };
}
exports.reqTwoFactorAuth = reqTwoFactorAuth;
async function verifyTwoFactorAuth(token, secret) {
    const isValid = speakeasy_1.default.totp.verify({
        secret: secret,
        encoding: "base32",
        token: token,
        step: 240,
        window: 2,
    });
    return isValid;
}
exports.verifyTwoFactorAuth = verifyTwoFactorAuth;
