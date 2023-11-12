import expressAsyncHandler from "express-async-handler";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { throwError } from "../../helpers";
import { Request } from "express";
import prisma from "../../configuration/prisma-client";

export const addreview = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const errors = validationResult(req.body);

    if (!errors.isEmpty()) {
      throwError("Invalid inputs", StatusCodes.BAD_REQUEST, true);
    }
    const authId = req.authId;

    try {
      const { rating, name, comment, productId } = req.body;

      const user = await prisma.user.findUnique({
        where: {
          id: authId,
        },
      });

      if (!user) {
        throwError("Unauthorizded user", StatusCodes.BAD_REQUEST, true);
      }
      const rate = Number(rating);
      const userReview = await prisma.review.create({
        data: {
          rating: rate,
          name: name as string,
          comment: comment,
          is_verified: Boolean(user?.is_varified), // Assuming the correct property name is "is_verified" and not "is_varified"
          avatar: user?.avatar as string,
          date: new Date(),
          product: { connect: { id: productId } },
          user: { connect: { id: user?.id } },
        },
      });

      res.status(StatusCodes.CREATED).json({
        review: userReview,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const getReviews = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const { authId } = req;

    try {
      const reviews = await prisma.review.findMany({
        where: {
          user_id: authId,
        },
      });

      res.status(StatusCodes.OK).json({
        message: "Reviews fetched successfully",
        reviews,
      });
    } catch (error) {
      next(error);
    }
  }
);
export const deleteReviews = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const id = req.params.id;
    try {
      const reviews = await prisma.review.delete({
        where: {
          id,
        },
      });

      if (!reviews) {
        throwError("Error deleting review", StatusCodes.BAD_REQUEST, true);
      }
      res.status(StatusCodes.OK).json({
        message: " Review deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);
