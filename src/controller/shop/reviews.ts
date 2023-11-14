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
      // fetch hthe revie
      // check the user and the product Id if they are the same
      // update the review field
      // but if they are not the same then u need to create a new review

      const review = await prisma.review.findMany({
        where: { product_id: productId },
      });

      let check = false;

      review.forEach((item) => {
        if (item.user_id === authId && item.product_id === productId) {
          check = true;
        }
      });

      const user = await prisma.user.findUnique({
        where: {
          id: authId,
        },
      });

      if (!user) {
        throwError("Unauthorizded user", StatusCodes.BAD_REQUEST, true);
      }
      const rate = Number(rating);
      let userReview;

      if (!check) {
        userReview = await prisma.review.create({
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
          messsage: "Review submitted successfully",
          review: userReview,
        });
      } else {
        res.status(StatusCodes.CREATED).json({
          messsage: "Please go to review page to update review",
        });
      }
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
