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
exports.getAdminReviews = exports.getAdminOrder = exports.payOrderWithWallet = exports.getUserOrder = exports.getAllOrder = exports.getOrder = exports.registeredUserCreateOrder = exports.visitorCreateOrder = void 0;
const http_status_codes_1 = require("http-status-codes");
const helpers_1 = require("../../helpers");
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_client_1 = __importDefault(require("../../configuration/prisma-client"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
dotenv_1.default.config();
exports.visitorCreateOrder = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, total, orderitem, name, state, city, address, status, country, shipping, phone, shippingType, refNo, } = req.body;
    const currentDate = new Date();
    const arrivalDate = shippingType === "express"
        ? currentDate.setDate(currentDate.getDate() + 4)
        : currentDate.setDate(currentDate.getDate() + 7);
    try {
        const visitorOrder = yield prisma_client_1.default.order.create({
            data: {
                email,
                total,
                orderitem,
                name,
                state,
                city,
                address,
                placedOn: `${new Date().toDateString()}`,
                status,
                country,
                shipping,
                phone,
                shippingType,
                refNo,
                arrivalDate: currentDate + "",
            },
        });
        const items = orderitem
            .map((item) => {
            if (!item.hasOwnProperty("paymentMethod")) {
                let elm = `  <tr>
             <td style="border: 1px solid black; padding: 5px">
               <div style="display: flex; gap: 20px; align-items: center;">
                 <div style="max-width: 80px; margin-right: 10px">
                   <img
                     src=${item.image}
                     alt=""
                     style="max-width: 80px; background-color: #d9d9d9"
                   />
                 </div>
                 <span >${item.name}</span>
               </div>
             </td>
             <td style="border: 1px solid black; padding: 5px">${item.qty}</td>
             <td style="border: 1px solid black; padding: 5px">₦${item.subTotal}</td>
           </tr>`;
                return elm;
            }
        })
            .join("");
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
    <main style="max-width: 500px; margin: 0 auto">
      <div
       style="
          margin: 0 auto;
          text-align: center;
        ">
        <img
          src="http://res.cloudinary.com/dynkejvim/image/upload/v1700249023/stewart/z7v1mytna75vjy7huccr.png"  style="
          margin-top: 20px;
        
        "
          alt="" />

        <h2>Thank You!</h2>
      </div>
      <p style="margin-bottom: 20px">
        Your order has been confirmed. You can view your order details below.
      </p>
      <p>Order ID: ${visitorOrder.id}</p>
      <table
        class="order-details"
        style="border-collapse: collapse; width: 100%; overflow-x: scroll;">
        <thead>
          <tr>
            <th style="border: 1px solid black; padding: 5px">Item</th>
            <th style="border: 1px solid black; padding: 5px">Quantity</th>
            <th style="border: 1px solid black; padding: 5px">Price</th>
          </tr>
        </thead>
        <tbody>
        ${items}
        </tbody>
      </table>
      <p style="margin-bottom: 10px; font-weight: bold;">Shipping: ₦${shipping}</p>
    
      <p style="margin-bottom: 10px; font-weight: bold;">Total: ₦${total}</p>
        <p style="margin-bottom: 10px; font-weight: bold;">Arrival Date: ${currentDate.toLocaleDateString("en-UK")}</p>
      <p style="margin-bottom: 10px; font-weight: bold;">Name: ${name}</p>
      <p style="margin-bottom: 10px; font-weight: bold;">
        Address: ${address}
      </p>
      <p style="margin-bottom: 10px; font-weight: bold">Email: ${email}</p>
    </main>
    <footer style="text-align: center; margin-top: 20px">
      <p>Copyright &copy; ${new Date().getFullYear()} Stewart Collection</p>
    </footer>
  </body>

      `;
        const subject = "Your Order Status";
        if (visitorOrder.status === "SUCCESS" ||
            visitorOrder.status === "PAY ON DELIVERY") {
            const mail = yield (0, helpers_1.sendEmail)(content, visitorOrder === null || visitorOrder === void 0 ? void 0 : visitorOrder.email, subject);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Order placed successfully",
                visitorOrder,
            });
        }
        else {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                message: "Your Order was not successful",
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.registeredUserCreateOrder = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, total, orderitem, name, state, city, address, country, status, shipping, phone, shippingType, refNo, } = req.body;
    const { authId } = req;
    const currentDate = new Date();
    const arrivalDate = shippingType === "express"
        ? currentDate.setDate(currentDate.getDate() + 4)
        : currentDate.setDate(currentDate.getDate() + 7);
    try {
        const visitorOrder = yield prisma_client_1.default.order.create({
            data: {
                email,
                total,
                orderitem,
                name,
                state,
                city,
                address,
                status,
                placedOn: `${new Date().toDateString()}`,
                country,
                shipping,
                phone,
                shippingType,
                user: { connect: { id: authId } },
                refNo,
                arrivalDate: currentDate + "",
            },
        });
        const items = orderitem
            .map((item) => {
            if (!item.hasOwnProperty("paymentMethod")) {
                let elm = `  <tr>
             <td style="border: 1px solid black; padding: 5px">
               <div style="display: flex; gap: 20px; align-items: center;">
                 <div style="max-width: 80px; margin-right: 10px">
                   <img
                     src=${item.image}
                     alt=""
                     style="max-width: 80px; background-color: #d9d9d9"
                   />
                 </div>
                 <span >${item.name}</span>
               </div>
             </td>
             <td style="border: 1px solid black; padding: 5px">${item.qty}</td>
             <td style="border: 1px solid black; padding: 5px">₦${item.subTotal}</td>
           </tr>`;
                return elm;
            }
        })
            .join("");
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
    <main style="max-width: 500px; margin: 0 auto">
      <div
       style="
          margin: 0 auto;
          text-align: center;
        ">
        <img
          src="http://res.cloudinary.com/dynkejvim/image/upload/v1700249023/stewart/z7v1mytna75vjy7huccr.png"  style="
          margin-top: 20px;
        
        "
          alt="" />

        <h2>Thank You!</h2>
      </div>
      <p style="margin-bottom: 20px">
        Your order has been confirmed. You can view your order details below.
      </p>
      <p>Order ID: ${visitorOrder.id}</p>
      <table
        class="order-details"
        style="border-collapse: collapse; width: 100%; overflow-x: scroll;">
        <thead>
          <tr>
            <th style="border: 1px solid black; padding: 5px">Item</th>
            <th style="border: 1px solid black; padding: 5px">Quantity</th>
            <th style="border: 1px solid black; padding: 5px">Price</th>
          </tr>
        </thead>
        <tbody>
        ${items}
        </tbody>
      </table>
      <p style="margin-bottom: 10px; font-weight: bold;">Shipping: ₦${shipping}</p>
    
      <p style="margin-bottom: 10px; font-weight: bold;">Total: ₦${total}</p>
        <p style="margin-bottom: 10px; font-weight: bold;">Arrival Date: ${currentDate.toLocaleDateString("en-UK")}</p>
      <p style="margin-bottom: 10px; font-weight: bold;">Name: ${name}</p>
      <p style="margin-bottom: 10px; font-weight: bold;">
        Address: ${address}
      </p>
      <p style="margin-bottom: 10px; font-weight: bold">Email: ${email}</p>
    </main>
    <footer style="text-align: center; margin-top: 20px">
      <p>Copyright &copy; ${new Date().getFullYear()} Stewart Collection</p>
    </footer>
  </body>

      `;
        const subject = "Your Order Status";
        if (visitorOrder.status === "SUCCESS" ||
            visitorOrder.status === "PAY ON DELIVERY") {
            const mail = yield (0, helpers_1.sendEmail)(content, visitorOrder === null || visitorOrder === void 0 ? void 0 : visitorOrder.email, subject);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                message: "Order placed successfully",
                visitorOrder,
            });
        }
        else {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                message: "Your Order was not successful",
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.getOrder = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.body;
    try {
        const order = yield prisma_client_1.default.order.findUnique({ where: { id: orderId } });
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json({ message: "Order has been fetched successfully", order });
    }
    catch (error) {
        next(error);
    }
}));
exports.getAllOrder = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authId } = req;
    try {
        const findAdmin = yield prisma_client_1.default.admin.findUnique({
            where: { id: authId },
        });
        if (!findAdmin) {
            (0, helpers_1.throwError)("Invalid admin user", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const order = yield prisma_client_1.default.order.findMany();
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json({ message: "Order has been fetched successfully", order });
    }
    catch (error) {
        next(error);
    }
}));
exports.getUserOrder = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authId } = req;
    try {
        const order = yield prisma_client_1.default.order.findMany({
            where: {
                id: authId,
            },
        });
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json({ message: "Order has been fetched successfully", order });
    }
    catch (error) {
        next(error);
    }
}));
exports.payOrderWithWallet = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req.body);
    if (!errors.isEmpty()) {
        (0, helpers_1.throwError)("Invalid Input", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
    }
    const { authId } = req;
    const { email, total, orderitem, name, state, city, address, country, status, shipping, phone, shippingType, } = req.body;
    try {
        const userWallet = yield prisma_client_1.default.wallet.findUnique({
            where: { user_id: authId },
        });
        if (!userWallet) {
            (0, helpers_1.throwError)("Invalid user", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const availableAmount = Number(userWallet === null || userWallet === void 0 ? void 0 : userWallet.amount);
        if (availableAmount < 500) {
            (0, helpers_1.throwError)("Insufficient wallet balance, fund your wallet", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        if (availableAmount < Number(total)) {
            (0, helpers_1.throwError)("Insufficient wallet balance, fund your wallet", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const currentDate = new Date();
        const arrivalDate = shippingType === "express"
            ? currentDate.setDate(currentDate.getDate() + 4)
            : currentDate.setDate(currentDate.getDate() + 7);
        const order = yield prisma_client_1.default.order.create({
            data: {
                email,
                total,
                orderitem,
                name,
                state,
                city,
                placedOn: `${new Date().toDateString()}`,
                address,
                country,
                status,
                shipping,
                phone,
                shippingType,
                refNo: authId,
                arrivalDate: currentDate + "",
                user: { connect: { id: authId } },
            },
        });
        const remainingAmount = availableAmount - Number(total);
        const updateWallet = yield prisma_client_1.default.wallet.update({
            where: { id: userWallet === null || userWallet === void 0 ? void 0 : userWallet.id },
            data: {
                amount: remainingAmount,
            },
        });
        const items = orderitem
            .map((item) => {
            if (!item.hasOwnProperty("paymentMethod")) {
                let elm = `  <tr>
             <td style="border: 1px solid black; padding: 5px">
               <div style="display: flex; gap: 20px; align-items: center;">
                 <div style="max-width: 80px; margin-right: 10px">
                   <img
                     src=${item.image}
                     alt=""
                     style="max-width: 80px; background-color: #d9d9d9"
                   />
                 </div>
                 <span >${item.name}</span>
               </div>
             </td>
             <td style="border: 1px solid black; padding: 5px">${item.qty}</td>
             <td style="border: 1px solid black; padding: 5px">₦${item.subTotal}</td>
           </tr>`;
                return elm;
            }
        })
            .join("");
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
    <main style="max-width: 500px; margin: 0 auto">
      <div
       style="
          margin: 0 auto;
          text-align: center;
        ">
        <img
          src="http://res.cloudinary.com/dynkejvim/image/upload/v1700249023/stewart/z7v1mytna75vjy7huccr.png"  style="
          margin-top: 20px;
        
        "
          alt="" />

        <h2>Thank You!</h2>
      </div>
      <p style="margin-bottom: 20px">
        Your order has been confirmed. You can view your order details below.
      </p>
      <p>Order ID: ${order.id}</p>
      <table
        class="order-details"
        style="border-collapse: collapse; width: 100%; overflow-x: scroll;">
        <thead>
          <tr>
            <th style="border: 1px solid black; padding: 5px">Item</th>
            <th style="border: 1px solid black; padding: 5px">Quantity</th>
            <th style="border: 1px solid black; padding: 5px">Price</th>
          </tr>
        </thead>
        <tbody>
        ${items}
        </tbody>
      </table>
      <p style="margin-bottom: 10px; font-weight: bold;">Shipping: ₦${shipping}</p>
    
      <p style="margin-bottom: 10px; font-weight: bold;">Total: ₦${total}</p>
        <p style="margin-bottom: 10px; font-weight: bold;">Arrival Date: ${currentDate.toLocaleDateString("en-UK")}</p>
      <p style="margin-bottom: 10px; font-weight: bold;">Name: ${name}</p>
      <p style="margin-bottom: 10px; font-weight: bold;">
        Address: ${address}
      </p>
      <p style="margin-bottom: 10px; font-weight: bold">Email: ${email}</p>
    </main>
    <footer style="text-align: center; margin-top: 20px">
      <p>Copyright &copy; ${new Date().getFullYear()} Stewart Collection</p>
    </footer>
  </body>

      `;
        const subject = "Your Order Status";
        if (order.status === "SUCCESS" || order.status === "PAY ON DELIVERY") {
            const mail = yield (0, helpers_1.sendEmail)(content, order === null || order === void 0 ? void 0 : order.email, subject);
            res
                .status(http_status_codes_1.StatusCodes.OK)
                .json({ message: "Order successfully placed", order });
        }
        else {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                message: "Your Order was not successful",
            });
        }
    }
    catch (error) {
        3;
        next(error);
    }
}));
exports.getAdminOrder = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authId } = req;
    try {
        const admin = yield prisma_client_1.default.admin.findUnique({
            where: { id: authId },
        });
        if (!admin) {
            (0, helpers_1.throwError)("Unauthorized admin", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const orders = yield prisma_client_1.default.order.findMany();
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "orders fetched successfully",
            orders,
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.getAdminReviews = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authId } = req;
    try {
        const admin = yield prisma_client_1.default.admin.findUnique({
            where: { id: authId },
        });
        if (!admin) {
            (0, helpers_1.throwError)("Unauthorized admin", http_status_codes_1.StatusCodes.BAD_REQUEST, true);
        }
        const reviews = yield prisma_client_1.default.review.findMany();
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "reviews fetched successfully",
            reviews,
        });
    }
    catch (error) {
        next(error);
    }
}));
