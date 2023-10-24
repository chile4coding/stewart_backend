import { ValidationError } from "express-validator";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
dotenv.config();

import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { Prisma } from "@prisma/client";

export interface requestError {
  status?: number;
  message?: string;
  statusCode?: number;
  validationError?: boolean;
}

export interface Error {
  message?: string;
  statusCode?: number;
  validationError?: boolean;
}

export const throwError = (
  errorMsg: string,
  statusCode: number,
  validationError?: boolean
) => {
  const error: Error = new Error(errorMsg);
  error.statusCode = statusCode;
  error.validationError = validationError;
  throw error;
};

export const salt = async () => <string>await bcrypt.genSalt(10);

export const hashPassword = async (password: string): Promise<string> => {
  const hashPassword = await bcrypt.hash(password, await salt());
  return hashPassword;
};

export const JWTToken = (email: string, userId: string, role: string) => {
  const token = jwt.sign(
    {
      email: email,
      authId: userId,
      role: role,
    },
    `${process.env.JWT_SECRET_KEY}`,
    { expiresIn: "30d" }
  );
  return token;
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) {
      throwError("Invalid password", StatusCodes.BAD_REQUEST);
    }
  } catch (error) {
    console.error(error);
    throwError("Invalid password", StatusCodes.BAD_REQUEST);
  }
};

export function isPrismaError(
  error: any
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError
  );
}

export const uploadImage = async function name(file: string) {

  const result = await cloudinary.uploader.upload(file, {
    folder: process.env.CLOUDINARY_UPLOAD_PATH,
  });

  return result;
};
