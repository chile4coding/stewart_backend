import { StatusCodes } from "http-status-codes";
import { sendEmail, throwError } from "../../helpers";
import dotenv from "dotenv";
import prisma from "../../configuration/prisma-client";
import expressAsyncHandler from "express-async-handler";
import auth from "../../middleware/auth";
import { validationResult } from "express-validator";
dotenv.config();

export const visitorCreateOrder = expressAsyncHandler(
  async (req, res, next) => {
    const {
      email,
      total,
      orderitem,
      name,
      state,
      city,
      address,
      status,
      country,
      shipping,
      phone,
      shippingType,
      refNo,
    } = req.body;

    const currentDate = new Date();

    const arrivalDate =
      shippingType === "express"
        ? currentDate.setDate(currentDate.getDate() + 4)
        : currentDate.setDate(currentDate.getDate() + 7);

    try {
      const visitorOrder = await prisma.order.create({
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
        .map((item: any) => {
          if (!item.hasOwnProperty("paymentMethod")){
            
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
        <p style="margin-bottom: 10px; font-weight: bold;">Arrival Date: ${currentDate.toLocaleDateString(
          "en-UK"
        )}</p>
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

      if (
        visitorOrder.status === "SUCCESS" ||
        visitorOrder.status === "PAY ON DELIVERY"
      ) {
        const mail = await sendEmail(
          content,
          visitorOrder?.email as string,
          subject
        );

        res.status(StatusCodes.OK).json({
          message: "Order placed successfully",
          visitorOrder,
        });
      } else {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: "Your Order was not successful",
        });
      }
    } catch (error) {
      next(error);
    }
  }
);
export const registeredUserCreateOrder = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const {
      email,
      total,
      orderitem,
      name,

      state,
      city,
      address,
      country,
      status,
      shipping,
      phone,
      shippingType,
      refNo,
    } = req.body;
    const { authId } = req;
    const currentDate = new Date();

    const arrivalDate =
      shippingType === "express"
        ? currentDate.setDate(currentDate.getDate() + 4)
        : currentDate.setDate(currentDate.getDate() + 7);

    try {
      const visitorOrder = await prisma.order.create({
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
         .map((item: any) => {
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
        <p style="margin-bottom: 10px; font-weight: bold;">Arrival Date: ${currentDate.toLocaleDateString(
          "en-UK"
        )}</p>
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

      if (
        visitorOrder.status === "SUCCESS" ||
        visitorOrder.status === "PAY ON DELIVERY"
      ) {
        const mail = await sendEmail(
          content,
          visitorOrder?.email as string,
          subject
        );

        res.status(StatusCodes.OK).json({
          message: "Order placed successfully",
          visitorOrder,
        });
      } else {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: "Your Order was not successful",
        });
      }
    } catch (error) {
      next(error);
    }
  }
);
export const getOrder = expressAsyncHandler(async (req, res, next) => {
  const { orderId } = req.body;
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    res
      .status(StatusCodes.OK)
      .json({ message: "Order has been fetched successfully", order });
  } catch (error) {
    next(error);
  }
});

export const getAllOrder = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const { authId } = req;

    try {
      const findAdmin = await prisma.admin.findUnique({
        where: { id: authId },
      });

      if (!findAdmin) {
        throwError("Invalid admin user", StatusCodes.BAD_REQUEST, true);
      }
      const order = await prisma.order.findMany();

      res
        .status(StatusCodes.OK)
        .json({ message: "Order has been fetched successfully", order });
    } catch (error) {
      next(error);
    }
  }
);

export const getUserOrder = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const { authId } = req;
    try {
      const order = await prisma.order.findMany({
        where: {
          id: authId,
        },
      });

      res
        .status(StatusCodes.OK)
        .json({ message: "Order has been fetched successfully", order });
    } catch (error) {
      next(error);
    }
  }
);
export const payOrderWithWallet = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const errors = validationResult(req.body);

    if (!errors.isEmpty()) {
      throwError("Invalid Input", StatusCodes.BAD_REQUEST, true);
    }
    const { authId } = req;

    const {
      email,
      total,
      orderitem,
      name,
      state,
      city,
      address,
      country,
      status,
      shipping,
      phone,
      shippingType,
    } = req.body;
    try {
      const userWallet = await prisma.wallet.findUnique({
        where: { user_id: authId },
      });

      if (!userWallet) {
        throwError("Invalid user", StatusCodes.BAD_REQUEST, true);
      }

      const availableAmount = Number(userWallet?.amount);

      if (availableAmount < 500) {
        throwError(
          "Insufficient wallet balance, fund your wallet",
          StatusCodes.BAD_REQUEST,
          true
        );
      }
      if (availableAmount < Number(total)) {
        throwError(
          "Insufficient wallet balance, fund your wallet",
          StatusCodes.BAD_REQUEST,
          true
        );
      }
      const currentDate = new Date();

      const arrivalDate =
        shippingType === "express"
          ? currentDate.setDate(currentDate.getDate() + 4)
          : currentDate.setDate(currentDate.getDate() + 7);

      const order = await prisma.order.create({
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

      const updateWallet = await prisma.wallet.update({
        where: { id: userWallet?.id },
        data: {
          amount: remainingAmount,
        },
      });

         const items = orderitem
           .map((item: any) => {
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
        <p style="margin-bottom: 10px; font-weight: bold;">Arrival Date: ${currentDate.toLocaleDateString(
          "en-UK"
        )}</p>
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
        const mail = await sendEmail(content, order?.email as string, subject);
        res
          .status(StatusCodes.OK)
          .json({ message: "Order successfully placed", order });
      } else {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: "Your Order was not successful",
        });
      }
    } catch (error) {
      3;
      next(error);
    }
  }
);
