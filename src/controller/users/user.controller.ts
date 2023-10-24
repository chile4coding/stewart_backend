import expressAsyncHandler from "express-async-handler";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import {
  JWTToken,
  comparePassword,
  hashPassword,
  throwError,
} from "../../helpers";
import prisma from "../../configuration/prisma-client";

export const createUser = expressAsyncHandler(async (req, res, next) => {
  const errors = validationResult(req.body);
  if (!errors.isEmpty()) {
    throwError("Invalid inputs", StatusCodes.BAD_REQUEST, true);
  }
  try {
    const { name, password, email, gender, dob } = req.body;

    const findUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (findUser) {
      throwError("User Already exist", StatusCodes.BAD_REQUEST, true);
    }
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name as string,
        passwords: hashedPassword,
        email: email,
        gender: gender,
        dob: dob,
      },
    });
    await prisma.wallet.create({
      data: {
        amount: 0.0,
        user: { connect: { id: user.id } },
      },
    });

    res.status(StatusCodes.CREATED).json({
      message: "Admin registrartion successful",
    });
  } catch (error) {
    next(error);
  }
});

export const loginUser = expressAsyncHandler(async (req, res, next) => {
  const errors = validationResult(req.body);

  if (errors.isEmpty()) {
    throwError("Invalid inputs", StatusCodes.BAD_REQUEST, true);
  }

  try {
    const { password, email } = req.body;

    const findUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!findUser) {
      throwError("User not hregistered", StatusCodes.BAD_REQUEST, true);
    }
    await comparePassword(password, findUser?.passwords as string);
    const token = JWTToken(
      findUser?.email as string,
      findUser?.id as string,
      findUser?.passwords as string
    );

    res.status(StatusCodes.OK).json({
      message: "Welcome toStewart Collections",
      token: token,
    });
  } catch (error) {
    next(error);
  }
});

export const fundWallet = expressAsyncHandler(
  async (req: Request | any, res, next) => {



    const errors = validationResult(req.body);

    if (!errors.isEmpty()) {
      throwError("Invalid Input", StatusCodes.BAD_REQUEST, true);
    }
    const authId = req.authId;
    try {
      const { status, amount } = req.body;
      if (status !== "success") {
        throwError("error in payment", StatusCodes.BAD_REQUEST, true);
      }
      const walletAmount = await prisma.wallet.findUnique({
        where: {
          user_id: authId,
        },
      });
      const amountUpdate = walletAmount?.amount + amount;
      const newWallet = await prisma.wallet.update({
        where: { id: walletAmount?.id },
        data: {
          amount: amountUpdate,
        },
      });
      res
        .status(StatusCodes.OK)
        .json({ message: "Wallet funded successfully", wallet: newWallet });
    } catch (error) {
      next(error);
    }
  }
);
