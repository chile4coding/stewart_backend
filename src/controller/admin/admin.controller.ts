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
import { error } from "console";

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
      message: "Welcome to Stewart Collections",
      token,
      findAdmin,
    });
  } catch (error) {
    next(error);
  }
});

export const adminGetAllUsers = expressAsyncHandler(
  async (req: any, res, next) => {
    const { authId } = req;

    try {
      const admin = await prisma.admin.findUnique({
        where: { id: authId },
      });
      if (!admin) {
        throwError("Invalid admin user", StatusCodes.BAD_REQUEST, true);
      }

      const users = await prisma.user.findMany();
      res.status(StatusCodes.OK).json({
        message: "users fetched successfully",
        users,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const getVistors = expressAsyncHandler(async (req: any, res, next) => {
  const { authId } = req;
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: authId },
    });
    if (!admin) {
      throwError("Invalid admin user", StatusCodes.BAD_REQUEST, true);
    }
    const visitors = await prisma.visitor.findMany();

    res.status(StatusCodes.OK).json({
      message: "visitor fetched successfully",
      visitors,
    });
  } catch (error) {
    next(error);
  }
});

export const adminGraph = expressAsyncHandler(async (req: any, res, next) => {
  const { authId } = req;

  try {
    const admin = await prisma.admin.findUnique({ where: { id: authId } });
    if (!admin) {
      throwError("Invalid admin user", StatusCodes.BAD_REQUEST, true);
    }
    const orders = await prisma.order.findMany();

    const Jan = orders.filter(
      (order) =>
        new Date(order.placedOn).getMonth() === 0 &&
        new Date(order.placedOn).getFullYear() === new Date().getFullYear()
    );
    const Feb = orders.filter(
      (order) =>
        new Date(order.placedOn).getMonth() === 1 &&
        new Date(order.placedOn).getFullYear() === new Date().getFullYear()
    );
    const March = orders.filter(
      (order) =>
        new Date(order.placedOn).getMonth() === 2 &&
        new Date(order.placedOn).getFullYear() === new Date().getFullYear()
    );
    const April = orders.filter(
      (order) =>
        new Date(order.placedOn).getMonth() === 3 &&
        new Date(order.placedOn).getFullYear() === new Date().getFullYear()
    );
    const May = orders.filter(
      (order) =>
        new Date(order.placedOn).getMonth() === 4 &&
        new Date(order.placedOn).getFullYear() === new Date().getFullYear()
    );
    const June = orders.filter(
      (order) =>
        new Date(order.placedOn).getMonth() === 5 &&
        new Date(order.placedOn).getFullYear() === new Date().getFullYear()
    );
    const Jul = orders.filter(
      (order) =>
        new Date(order.placedOn).getMonth() === 6 &&
        new Date(order.placedOn).getFullYear() === new Date().getFullYear()
    );
    const Aug = orders.filter(
      (order) =>
        new Date(order.placedOn).getMonth() === 7 &&
        new Date(order.placedOn).getFullYear() === new Date().getFullYear()
    );
    const Sep = orders.filter(
      (order) =>
        new Date(order.placedOn).getMonth() === 8 &&
        new Date(order.placedOn).getFullYear() === new Date().getFullYear()
    );
    const Oct = orders.filter(
      (order) =>
        new Date(order.placedOn).getMonth() === 9 &&
        new Date(order.placedOn).getFullYear() === new Date().getFullYear()
    );
    const Nov = orders.filter(
      (order) =>
        new Date(order.placedOn).getMonth() === 10 &&
        new Date(order.placedOn).getFullYear() === new Date().getFullYear()
    );
    const Dec = orders.filter(
      (order) =>
        new Date(order.placedOn).getMonth() === 11 &&
        new Date(order.placedOn).getFullYear() === new Date().getFullYear()
    );

    const userData1 = [
      {
        id: 1,
        month: "Jan",
        orders: Jan.length,
      },
      {
        id: 2,
        month: "Feb",
        orders: Feb.length,
      },
      {
        id: 3,
        month: "Mar",

        orders: March.length,
      },
      {
        id: 4,
        month: "Apr",

        orders: April.length,
      },
      {
        id: 5,
        month: "May",

        orders: May.length,
      },
      {
        id: 6,
        month: "Jun",

        orders: June.length,
      },
      {
        id: 7,
        month: "Jul",
        orders: Jul.length,
      },
      {
        id: 8,
        month: "Aug",
        orders: Aug.length,
      },
      {
        id: 9,
        month: "Sep",
        orders: Sep.length,
      },
      {
        id: 10,
        month: "Oct",
        orders: Oct.length,
      },
      {
        id: 6,
        month: "Nov",
        orders: Nov.length,
      },
      {
        id: 6,
        month: "Dec",
        orders: Dec.length,
      },
    ];

    res.status(StatusCodes.OK).json({
      message: "orders graph fetched successfully",
      userData1,
    });
  } catch (error) {
    next(error);
  }
});

export const updateAdminProfile = expressAsyncHandler(
  async (req: any, res, next) => {
    const { authId } = req;
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      throwError("Invalid inputs", StatusCodes.BAD_REQUEST, true);
    }
    try {
      const admin = await prisma.admin.findUnique({
        where: { id: authId },
      });

      if (!admin) {
        throwError("Invalid admin user", StatusCodes.BAD_REQUEST, true);
      }
      const {
        firstName,
        lastName,
        city,
        country,
        state,
        password,
        email,
        phone,
      } = req.body;


      const updateAdmin = await prisma.admin.update({
        where: { id: authId },
        data: {
          first_name: firstName,
          last_name: lastName,
          name: city,
          country,
          state,
          password,
          email,
          phone_number: phone,
        },
      });

      if (!updateAdmin) {
        throwError("Server Error", StatusCodes.BAD_REQUEST, true);
      }

      res.status(StatusCodes.OK).json({
        message: "Profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);
export const updateAdminProfilePics = expressAsyncHandler(
  async (req: any, res, next) => {
    const { authId } = req;
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      throwError("Invalid inputs", StatusCodes.BAD_REQUEST, true);
    }
    try {
      const admin = await prisma.admin.findUnique({
        where: { id: authId },
      });

      if (!admin) {
        throwError("Invalid admin user", StatusCodes.BAD_REQUEST, true);
      }
      const { avatar } = req.body;

      const updateAdmin = await prisma.admin.update({
        where: { id: authId },
        data: {
          avatar_url: avatar,
        },
      });

      if (!updateAdmin) {
        throwError("Server Error", StatusCodes.BAD_REQUEST, true);
      }

      res.status(StatusCodes.OK).json({
        message: "Profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);
export const getAdminProfile = expressAsyncHandler(
  async (req: any, res, next) => {
    const { authId } = req;
    try {
      const admin = await prisma.admin.findUnique({
        where: { id: authId },
      });

      if (!admin) {
        throwError("Invalid admin user", StatusCodes.BAD_REQUEST, true);
      }

      res.status(StatusCodes.OK).json({
        message: "Admin user fetched succcessully",
        admin,
      });
    } catch (error) {
      next(error);
    }
  }
);
