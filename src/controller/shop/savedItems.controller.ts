import expressAsyncHandler from "express-async-handler";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { throwError } from "../../helpers";
import { Request } from "express";
import prisma from "../../configuration/prisma-client";

export const getSavedItems = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const { authId } = req;
    try {
      const savedItems = await prisma.saveItem.findMany({
        where: { user_id: authId },
      });
      res.send(StatusCodes.OK).json({
        savedItems,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const deleteSavedItem = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.body;
  try {
    const savedItem = await prisma.saveItem.delete({
      where: {
        id: id,
      },
    });
    if (!savedItem) {
      throwError("Error deleting saved item", StatusCodes.BAD_REQUEST, true);
    }
    res.status(StatusCodes.OK).json({
      message: "Saved item deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export const saveItem = expressAsyncHandler(
  async (req: Request | any, res, next) => {

    function convertFalseToBoolean(value : string) {
      if (typeof value === "string" && value === "false") {
        return false;
      } else {
        return Boolean(value);
      }
    }
    const { authId } = req;
    const { name, image, amount, id, status } = req.body;

    try {
      if (convertFalseToBoolean(status)) {
        const savedItem = await prisma.saveItem.deleteMany({
          where: { item_id: id, user_id: authId  as string},
        });
        res.send(StatusCodes.OK).json({
          savedItem,
        });
      } else {
        const saved = await prisma.saveItem.create({
          data: {
            name: name as string,
            image: image as string,
            amount: amount,
            status: convertFalseToBoolean(status),
            user: { connect: { id: authId as string } },
            item_id: id
          },
        });
        res.send(StatusCodes.OK).json({
          saved,
        });
      }
    } catch (error) {
      next(error);
    }
  }
);
