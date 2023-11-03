import expressAsyncHandler from "express-async-handler";
import prisma from "../../configuration/prisma-client";
import { validationResult } from "express-validator/src/validation-result";
import { StatusCodes } from "http-status-codes";
import {
  JWTToken,
  comparePassword,
  hashPassword,
  throwError,
} from "../../helpers";

export const createAdmin = expressAsyncHandler(async (req, res, next) => {
  const errors = validationResult(req.body);
  if (!errors.isEmpty()) {
    throwError("Invalid inputs", StatusCodes.BAD_REQUEST, true);
  }
  try {
    const { email, password } = req.body;

    const findAdmin = await prisma.admin.findUnique({
      where: {
        email,
      },
    });
    if (findAdmin) {
      throwError("Admin Already registered", StatusCodes.BAD_REQUEST, true);
    }
    const checkMoreThanOneAdmin = await prisma.admin.findMany();
    console.log(checkMoreThanOneAdmin);
    if (checkMoreThanOneAdmin.length >= 1) {
      throwError(
        "Stewart Collect can not allow multiple admin",
        StatusCodes.BAD_GATEWAY,
        true
      );
    }
    const hashedPassword = await hashPassword(password);

    const admin = await prisma.admin.create({
      data: { email, password: hashedPassword },
    });

    if (!admin) {
      throwError("Server Error", StatusCodes.BAD_REQUEST, true);
    }
    res.status(StatusCodes.CREATED).json({
      message: "Admin registrartion successful",
    });
  } catch (error) {
    next(error);
  }
});

export const loginAdmin = expressAsyncHandler(async (req, res, next) => {
  const errors = validationResult(req.body);
  if (!errors.isEmpty()) {
    throwError("Invalid inputs", StatusCodes.BAD_REQUEST, true);
  }
  try {
    const { email, password } = req.body;
    const findAdmin = await prisma.admin.findUnique({
      where: {
        email,
      },
    });
    if (!findAdmin) {
      throwError(
        "Admin user not found, wrong email entered",
        StatusCodes.BAD_REQUEST,
        true
      );
    }
    await comparePassword(password, findAdmin?.password as string);
    const token = JWTToken(
      findAdmin?.email as string,
      findAdmin?.id as string,
      findAdmin?.password as string
    );
    res.status(StatusCodes.OK).json({
      message: "Welcome to sStewart Collections",
      token,
    });
  } catch (error) {
    next(error);
  }
});
