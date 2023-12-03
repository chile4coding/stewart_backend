import expressAsyncHandler from "express-async-handler";
import { NextFunction, Request } from "express";

import { validationResult } from "express-validator";
import { throwError, uploadImage } from "../../helpers";
import { StatusCodes } from "http-status-codes";
import prisma from "../../configuration/prisma-client";
import { url } from "inspector";

export const createCategory = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const errors = validationResult(req.body);

    if (!errors.isEmpty()) {
      throwError("Invalid inputs", StatusCodes.BAD_REQUEST, true);
    }
    const authId = req.authId;

    try {
      const { name, productImage } = req.body;
      const admin = await prisma.admin.findUnique({
        where: {
          id: authId,
        },
      });
      if (!admin) {
        throwError("Invalid admin user", StatusCodes.BAD_REQUEST, true);
      }

      let productCategory;
      productCategory = await prisma.category.findFirst({
        where: {
          name: name,
        },
      });

      if (productCategory) {
        await prisma.category.update({
          where: {
            id: productCategory.id,
          },
          data: {
            name: name,
            image: productImage,
          },
        });
      } else {
        productCategory = await prisma.category.create({
          data: {
            name: name,
            image: productImage,
          },
        });
      }
      res.status(StatusCodes.OK).json({
        productCategory,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const createOrUpdateProduct = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const {
      categoryId,
      name,
      price,
      discount,
      initialSize,
      initialColor,
      description,
      productId,
      salesPrice,
      image_url,
      short_desc,
    } = req.body;

    const authId = req.authId;

    try {
      const subscriberPrice: number = Number(
        (price - Number(price) * (Number(discount) / 100)).toFixed(2)
      );

      const admin = await prisma.admin.findUnique({
        where: {
          id: authId,
        },
      });

      if (!admin) {
        throwError("Invalid admin user", StatusCodes.BAD_REQUEST, true);
      }

      const productCategory = await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });
      let product;

      if (productId.length > 5) {
        product = await prisma.product.findUnique({
          where: {
            id: productId,
          },
        });
        if (!product) {
          throwError("product not found", StatusCodes.BAD_GATEWAY, true);
        }

        const p = Number(Number(price).toFixed(2));
        const pr = parseFloat(p.toFixed(2));

        product = await prisma.product.update({
          where: { id: productId },
          data: {
            name: name,
            price: pr,
            short_desc:short_desc,
            initial_color: initialColor,
            initial_size: initialSize,
            description: description,
            categoryName: productCategory?.name,
            category_id: categoryId,
            sales_price: Number(salesPrice),
            discount: parseFloat(Number(discount).toFixed(2)),
            subscriber_price: parseFloat(subscriberPrice.toFixed(2)),
            image: image_url,
          },
        });
        res.status(StatusCodes.CREATED).json({
          message: "product added successfully",
          product,
        });
      } else {
        product = await prisma.product.create({
          data: {
            category_id: categoryId,
            name: name,
            price: Number(Number(price).toFixed(2)),
            initial_color: initialColor,
            short_desc:short_desc,
            initial_size: initialSize,
            description: description,
            categoryName: productCategory?.name,
            sales_price: Number(salesPrice),
            discount: parseFloat(Number(discount).toFixed(2)),
            subscriber_price: parseFloat(subscriberPrice.toFixed(2)),
            image: image_url,
          },
        });

        res.status(StatusCodes.CREATED).json({
          message: "product added successfully",
          product,
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

export const createOrUpdateSize = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const errors = validationResult(req.params);

    if (!errors.isEmpty()) {
      throwError("Invalid inputs", StatusCodes.BAD_REQUEST, true);
    }
    const authId = req.authId;

    const { name, productId, waist, length, sleaves } = req.body;

    try {
      const admin = await prisma.admin.findUnique({
        where: {
          id: authId,
        },
      });

      if (!admin) {
        throwError("Invalid admin user", StatusCodes.BAD_REQUEST, true);
      }

      const size = await prisma.size.create({
        data: {
          name: name,
          waist: waist,
          length:length,
          sleaves: sleaves,
          product: { connect: { id: productId } },
        },
      });
      res.status(StatusCodes.CREATED).json({
        message: "product size added successfully",
        size,
      });
    } catch (error) {
      next(error);
    }
  }
);
export const createOrUpdateClothColor = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const authId = req.authId;
    try {
      const { name, price, discount, colorId, sizeId, sales_price, image_url } =
        req.body;
      const subscriberPrice: number = Number(
        (price - Number(price) * (Number(discount) / 100)).toFixed(2)
      );
      const admin = await prisma.admin.findUnique({
        where: {
          id: authId,
        },
      });
      if (!admin) {
        throwError("Invalid admin user", StatusCodes.BAD_REQUEST, true);
      }
      const p = Number(Number(price).toFixed(2));
      const pr = parseFloat(p.toFixed(2));

      console.log(colorId);
      let color;
      if (colorId.trim().length > 2) {
        color = await prisma.color.findUnique({
          where: {
            id: colorId,
          },
        });
        if (!color) {
          throwError("color not found", StatusCodes.BAD_GATEWAY, true);
        }
        color = await prisma.color.update({
          where: { id: colorId },
          data: {
            name: name,
            price: pr,
            sales_price: Number(sales_price),
            size_id: sizeId,
            discount: parseFloat(Number(discount).toFixed(2)),
            subscriber_price: parseFloat(subscriberPrice.toFixed(2)),
            image: image_url,
          },
        });
        res.status(StatusCodes.CREATED).json({
          message: "product added successfully",
          color,
        });
      } else {
        color = await prisma.color.create({
          data: {
            name: name,
            price: pr,
            sales_price: Number(sales_price),
            size: { connect: { id: sizeId } },
            discount: parseFloat(Number(discount).toFixed(2)),
            subscriber_price: parseFloat(subscriberPrice.toFixed(2)),
            image: image_url,
          },
        });
        res.status(StatusCodes.CREATED).json({
          message: "product added successfully",
          color,
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

export const getCategory = expressAsyncHandler(async (req:any, res, next) => {
  try {

    if(!req.session.visited){
      await prisma.visitor.create({
        data:{
          isvistor:true
        }
      })
      req.session.visited  =  true

    }
    const category = await prisma.category.findMany({
      include: {
        product: {
          include: {
            size: {
              include: {
                colors: true,
              },
            },
          },
        },
      },
    });
    res.status(StatusCodes.OK).json({
      category,
    });
  } catch (err) {
    next(err);
  }
});
export const getProduct = expressAsyncHandler(async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        reviews: {
          include:{
            user:true
          }
        },
        size: {
          include: {
            colors: true,
          },
          
        },
      },
    });
    res.status(StatusCodes.OK).json({
      products,
    });
  } catch (err) {
    next(err);
  }
});
export const getSizes = expressAsyncHandler(async (req, res, next) => {
  try {
    const sizes = await prisma.size.findMany({
      include: {
        colors: true,
      },
    });
    res.status(StatusCodes.OK).json({
      sizes,
    });
  } catch (err) {
    next(err);
  }
});
export const getColors = expressAsyncHandler(async (req, res, next) => {
  try {
    const colors = await prisma.color.findMany();
    res.status(StatusCodes.OK).json({
      colors,
    });
  } catch (err) {
    next(err);
  }
});
export const removeAProduct = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      throwError("Invalid inputs", StatusCodes.BAD_REQUEST, true);
    }
    const authId = req.authId;

    const { productId } = req.body;
    try {
      const admin = await prisma.admin.findUnique({ where: { id: authId } });
      if (!admin) {
        throwError("Unauthorized usser", StatusCodes.BAD_REQUEST, true);
      }
      const deleteProduct = await prisma.product.delete({
        where: { id: productId },
      });

      if (!deleteProduct) {
        throwError("Error deleting product", StatusCodes.BAD_REQUEST, true);
      }
      res.status(StatusCodes.OK).json({
        message: "product deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }
);
export const removeAProductColor = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      throwError("Invalid inputs", StatusCodes.BAD_REQUEST, true);
    }
    const authId = req.authId;

    const { productColorId } = req.body;
    try {
      const admin = await prisma.admin.findUnique({ where: { id: authId } });
      if (!admin) {
        throwError("Unauthorized usser", StatusCodes.BAD_REQUEST, true);
      }
      const deleteProduct = await prisma.color.delete({
        where: { id: productColorId },
      });

      if (!deleteProduct) {
        throwError("Error deleting product", StatusCodes.BAD_REQUEST, true);
      }
      res.status(StatusCodes.OK).json({
        message: "product deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }
);
