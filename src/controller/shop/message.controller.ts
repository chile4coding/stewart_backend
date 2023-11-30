import { StatusCodes } from "http-status-codes";
import { sendEmail, throwError } from "../../helpers";
import dotenv from "dotenv";
import prisma from "../../configuration/prisma-client";
import expressAsyncHandler from "express-async-handler";
import auth from "../../middleware/auth";
import { validationResult } from "express-validator";
import { socket } from "../../server/server";
dotenv.config();

export const getMessages = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const { authId } = req;
    try {
      const inbox = await prisma.inbox.findMany({
        where: { user_id: authId },
      });

      
      res.status(StatusCodes.OK).json({
        message: "Messages successfullly fetched",
        inbox,
      });
    } catch (error) {
      next(error);
    }
  }
);
export const getNotifications = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const { authId } = req;
    try {
      const inbox = await prisma.notifications.findMany({
        where: { user_id: authId },
      });
      res.status(StatusCodes.OK).json({
        message: "Notifications successfullly fetched",
        inbox,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const deleteMessage = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    try {
      const { id } = req.body;
      const message = await prisma.inbox.delete({
        where: {
          id: id,
        },
      });
      if (!message) {
        throwError("Error deleting message", StatusCodes.BAD_REQUEST, true);
      }
      res.status(StatusCodes.OK).json({
        message: "Message deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);
export const deleteNotification = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    try {
      const { id } = req.body;
      const message = await prisma.notifications.delete({
        where: {
          id: id,
        },
      });
      if (!message) {
        throwError(
          "Error deleting notification",
          StatusCodes.BAD_REQUEST,
          true
        );
      }
      res.status(StatusCodes.OK).json({
        message: "notification deleted deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

export const sendMessage = expressAsyncHandler(async (req: any, res, next) => {
  const { authId } = req;
  const { title, message } = req.body;

  try {
    const admin = await prisma.admin.findUnique({ where: { id: authId } });

    if (!admin) {
      throwError("Unauthorized Admin", StatusCodes.BAD_REQUEST, true);
    }
    const customers = await prisma.user.findMany();

    async function createMessage(title: string, message: string, id: String) {
      await prisma.inbox.create({
        data: {
          title,
          message,
          user: { connect: { id: id as string } },
          date: `${new Date().toLocaleDateString("en-UK")}`,
        },
      });

      await prisma.notifications.create({
        data: {
          notification: "New message received",
          link: "/message",
          user: { connect: { id: id as string } },
          date: `${new Date().getTime()}`,
        },
      });
    }

    for (const user of customers) {
       createMessage(title, message, user.id);
    }

    socket.emit("new-message");
    res.status(StatusCodes.OK).json({
      message: "Message sent",
    });
  } catch (error) {
    next(error);
  }
});
export const adminMessage = expressAsyncHandler(async (req: any, res, next) => {
  const { authId } = req;
  try {
    const admin = await prisma.admin.findUnique({ where: { id: authId } });

    if (!admin) {
      throwError("Unauthorized Admin", StatusCodes.BAD_REQUEST, true);
    }

    const messages = await prisma.inbox.findMany();

    res.status(StatusCodes.OK).json({
      message: "Message  fetched successfully",
      messages,
    });
  } catch (error) {
    next(error);
  }
});
