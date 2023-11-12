import { StatusCodes } from "http-status-codes";
import { sendEmail, throwError } from "../../helpers";
import dotenv from "dotenv";
import prisma from "../../configuration/prisma-client";
import expressAsyncHandler from "express-async-handler";
import auth from "../../middleware/auth";
import { validationResult } from "express-validator";
dotenv.config();

export const getMessages = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const { authId } = req;
    try {
      const inbox = await prisma.inbox.findMany({
        where: { user_id: authId },
      });
      res.send(StatusCodes.OK).json({
        message: "Messages successfullly fetched",
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
      const { id } = req.params;
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
