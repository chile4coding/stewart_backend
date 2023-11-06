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

      if (visitorOrder.status !== "success") {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: "Your Order was not successful",
        });
      }

      const mail = await sendEmail(
        content,
        visitorOrder?.email as string,
        subject
      );

      console.log(mail);
      res.status(StatusCodes.OK).json({
        message: "Order placed successfully",
        visitorOrder,
      });
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

      const mail = await sendEmail(
        content,
        visitorOrder?.email as string,
        subject
      );

      console.log(mail);

      res.status(StatusCodes.OK).json({
        message: "Order placed successfully",
        visitorOrder,
      });
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
