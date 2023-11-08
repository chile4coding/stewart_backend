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
          status,
          country,
          shipping,
          phone,
          shippingType,
          refNo,
          arrivalDate: currentDate + "",
        },
      });

      const content = `<p> Your order has been  received please. </p> <p> Track your order with the id</p>  <p> Tracking id:  <h2> ${visitorOrder.id}  </h2> </p>   <br> <p>Enter the your tracking Id  to the link you clicked on below  </p> <br> 
      <a href="https://stewart-frontend-chile4coding.vercel.app/"   >Click to track your order</a>
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
          country,
          shipping,
          phone,
          shippingType,
          user: { connect: { id: authId } },
          refNo,
          arrivalDate: currentDate + "",
        },
      });

      const content = `<p> Your order has been  received please. </p> <p> Track your order with the id</p>  <p> Tracking id:  <h2> ${visitorOrder.id}  </h2> </p>   <br> <p>Enter the your tracking Id  to the link you clicked on below  </p> <br> 
      <a href="https://stewart-frontend-chile4coding.vercel.app/"   >Click to track your order</a>
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

      const order = await prisma.order.create({
        data: {
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
          refNo: authId,
          user: { connect: { id: authId } },
        },
      });

      const updateWallet = await prisma.wallet.update({
        where: { id: userWallet?.id },
        data: {
          amount: availableAmount - Number(total),
        },
      });

      console.log(updateWallet)

      res
        .status(StatusCodes.OK)
        .json({ message: "Order successfully placed", order });
    } catch (error) {
      next(error);
    }
  }
);
