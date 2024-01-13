"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactUsMessage = exports.getAdminProfile = exports.updateAdminProfilePics = exports.updateAdminProfile = exports.adminGraph = exports.getVistors = exports.adminGetAllUsers = exports.loginAdmin = exports.createAdmin = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const prisma_client_1 = __importDefault(require("../../configuration/prisma-client"));
const validation_result_1 = require("express-validator/src/validation-result");
const http_status_codes_1 = require("http-status-codes");
const helpers_1 = require("../../helpers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.createAdmin = (0, express_async_handler_1.default)(async (req, res, next) => {
    const errors = (0, validation_result_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    try {
        const { email, password } = req.body;
        const findAdmin = await prisma_client_1.default.admin.findUnique({
            where: {
                email,
            },
        });
        if (findAdmin) {
            (0, helpers_1.throwError)("Admin Already registered", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const checkMoreThanOneAdmin = await prisma_client_1.default.admin.findMany();
        console.log(checkMoreThanOneAdmin);
        if (checkMoreThanOneAdmin.length >= 1) {
            (0, helpers_1.throwError)("Stewart Collect can not allow multiple admin", http_status_codes_1.StatusCodes.BAD_GATEWAY, true);
        }
        const hashedPassword = await (0, helpers_1.hashPassword)(password);
        const admin = await prisma_client_1.default.admin.create({
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
});
exports.loginAdmin = (0, express_async_handler_1.default)(async (req, res, next) => {
    const errors = (0, validation_result_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    try {
        const { email, password } = req.body;
        const findAdmin = await prisma_client_1.default.admin.findUnique({
            where: {
                email,
            },
        });
        if (!findAdmin) {
            (0, helpers_1.throwError)("Admin user not found, wrong email entered", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const findAdminUpdate = await prisma_client_1.default.admin.update({
            where: { id: findAdmin?.id },
            data: {
                last_login: `${new Date().toLocaleDateString("en-UK")} ${new Date().toLocaleTimeString("en-UK")}`,
            },
        });
        await (0, helpers_1.comparePassword)(password, findAdmin?.password);
        const token = (0, helpers_1.JWTToken)(findAdmin?.email, findAdmin?.id, findAdmin?.password);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Welcome to Stewart Collections",
            token,
            findAdminUpdate,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.adminGetAllUsers = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { authId } = req;
    try {
        const admin = await prisma_client_1.default.admin.findUnique({
            where: { id: authId },
        });
        if (!admin) {
            (0, helpers_1.throwError)("Invalid admin user", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const users = await prisma_client_1.default.user.findMany();
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "users fetched successfully",
            users,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getVistors = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { authId } = req;
    try {
        const admin = await prisma_client_1.default.admin.findUnique({
            where: { id: authId },
        });
        if (!admin) {
            (0, helpers_1.throwError)("Invalid admin user", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const visitors = await prisma_client_1.default.visitor.findMany();
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "visitor fetched successfully",
            visitors,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.adminGraph = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { authId } = req;
    try {
        const admin = await prisma_client_1.default.admin.findUnique({ where: { id: authId } });
        if (!admin) {
            (0, helpers_1.throwError)("Invalid admin user", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const orders = await prisma_client_1.default.order.findMany();
        const Jan = orders.filter((order) => new Date(order.placedOn).getMonth() === 0 &&
            new Date(order.placedOn).getFullYear() === new Date().getFullYear());
        const Feb = orders.filter((order) => new Date(order.placedOn).getMonth() === 1 &&
            new Date(order.placedOn).getFullYear() === new Date().getFullYear());
        const March = orders.filter((order) => new Date(order.placedOn).getMonth() === 2 &&
            new Date(order.placedOn).getFullYear() === new Date().getFullYear());
        const April = orders.filter((order) => new Date(order.placedOn).getMonth() === 3 &&
            new Date(order.placedOn).getFullYear() === new Date().getFullYear());
        const May = orders.filter((order) => new Date(order.placedOn).getMonth() === 4 &&
            new Date(order.placedOn).getFullYear() === new Date().getFullYear());
        const June = orders.filter((order) => new Date(order.placedOn).getMonth() === 5 &&
            new Date(order.placedOn).getFullYear() === new Date().getFullYear());
        const Jul = orders.filter((order) => new Date(order.placedOn).getMonth() === 6 &&
            new Date(order.placedOn).getFullYear() === new Date().getFullYear());
        const Aug = orders.filter((order) => new Date(order.placedOn).getMonth() === 7 &&
            new Date(order.placedOn).getFullYear() === new Date().getFullYear());
        const Sep = orders.filter((order) => new Date(order.placedOn).getMonth() === 8 &&
            new Date(order.placedOn).getFullYear() === new Date().getFullYear());
        const Oct = orders.filter((order) => new Date(order.placedOn).getMonth() === 9 &&
            new Date(order.placedOn).getFullYear() === new Date().getFullYear());
        const Nov = orders.filter((order) => new Date(order.placedOn).getMonth() === 10 &&
            new Date(order.placedOn).getFullYear() === new Date().getFullYear());
        const Dec = orders.filter((order) => new Date(order.placedOn).getMonth() === 11 &&
            new Date(order.placedOn).getFullYear() === new Date().getFullYear());
        const userData1 = [
            {
                id: 1,
                month: "Jan",
                orders: Jan.length,
            },
            {
                id: 2,
                month: "Feb",
                orders: Feb.length,
            },
            {
                id: 3,
                month: "Mar",
                orders: March.length,
            },
            {
                id: 4,
                month: "Apr",
                orders: April.length,
            },
            {
                id: 5,
                month: "May",
                orders: May.length,
            },
            {
                id: 6,
                month: "Jun",
                orders: June.length,
            },
            {
                id: 7,
                month: "Jul",
                orders: Jul.length,
            },
            {
                id: 8,
                month: "Aug",
                orders: Aug.length,
            },
            {
                id: 9,
                month: "Sep",
                orders: Sep.length,
            },
            {
                id: 10,
                month: "Oct",
                orders: Oct.length,
            },
            {
                id: 6,
                month: "Nov",
                orders: Nov.length,
            },
            {
                id: 6,
                month: "Dec",
                orders: Dec.length,
            },
        ];
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "orders graph fetched successfully",
            userData1,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateAdminProfile = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { authId } = req;
    const errors = (0, validation_result_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    try {
        const admin = await prisma_client_1.default.admin.findUnique({
            where: { id: authId },
        });
        if (!admin) {
            (0, helpers_1.throwError)("Invalid admin user", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const { firstName, lastName, city, country, state, password, email, phone, } = req.body;
        const updateAdmin = await prisma_client_1.default.admin.update({
            where: { id: authId },
            data: {
                first_name: firstName,
                last_name: lastName,
                name: city,
                country,
                state,
                password,
                email,
                phone_number: phone,
            },
        });
        if (!updateAdmin) {
            (0, helpers_1.throwError)("Server Error", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Profile updated successfully",
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateAdminProfilePics = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { authId } = req;
    const errors = (0, validation_result_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid inputs", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    try {
        const admin = await prisma_client_1.default.admin.findUnique({
            where: { id: authId },
        });
        if (!admin) {
            (0, helpers_1.throwError)("Invalid admin user", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const { avatar } = req.body;
        const updateAdmin = await prisma_client_1.default.admin.update({
            where: { id: authId },
            data: {
                avatar_url: avatar,
            },
        });
        if (!updateAdmin) {
            (0, helpers_1.throwError)("Server Error", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Profile updated successfully",
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAdminProfile = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { authId } = req;
    try {
        const admin = await prisma_client_1.default.admin.findUnique({
            where: { id: authId },
        });
        if (!admin) {
            (0, helpers_1.throwError)("Invalid admin user", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Admin user fetched succcessully",
            admin,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.contactUsMessage = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { message, email, phone, firstname, lastname } = req.body;
    try {
        const content = `
  <body style="font-family: sans-serif; padding: 0; max-width: 600px; margin: 0 auto">
    <header
      style="
        text-align: center;
        background-color:#d9d9d9;
        display: flex;
        align-items: center;
        margin: 0 auto;
        justify-content: center;
      ">
      <img
        src="http://res.cloudinary.com/dynkejvim/image/upload/v1700235033/stewart/puv5v0bxq3zrojoqy2hn.png"
        alt="Stewart Collection Logo"
        style="max-width: 200px; max-width: 60px" />
      <h1>
        <span style="color: #000000; font-size: 18px">STEWART COLLECTION</span>
      </h1>
    </header>
     
     <p>${message}</p>
    <h5>Sender: ${firstname} ${lastname}</h5>
    <h5>Email: ${email}</h5>
    <h5>Phone: ${phone}</h5>
        <footer style="text-align: center; margin-top: 20px">
      <p>Copyright &copy; ${new Date().getFullYear()} Stewart Collection</p>
    </footer>
  </body>

      `;
        const subject = "You have message from a customer";
        await (0, helpers_1.sendEmail)(content, process.env.EMAIL, subject);
        await prisma_client_1.default.contactus.create({
            data: {
                message,
                email,
                phone,
                firstname,
                lastname,
            },
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "message sent succcessully",
        });
    }
    catch (error) {
        next(error);
    }
});
