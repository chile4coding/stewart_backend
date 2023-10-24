import expressAsyncHandler from "express-async-handler";
import { NextFunction, Request } from "express";

import { validationResult } from "express-validator";
import { throwError, uploadImage } from "../../helpers";
import { StatusCodes } from "http-status-codes";
import prisma from "../../configuration/prisma-client";
import { url } from "inspector";

export const createCategory = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const errors = validationResult(req.params);

   
    if (!errors.isEmpty()) {
      throwError("Invalid inputs", StatusCodes.BAD_REQUEST, true);
    }
    const authId = req.authId;

    try {
      if ("file" in req) {
        if (!req.path) {
          throwError("file is requiered", StatusCodes.BAD_REQUEST, true);
        }
        const { name } = req.params;
        const admin = await prisma.admin.findUnique({
          where: {
            id: authId,
          },
        });
        if (!admin) {
          throwError("Invalid admin user", StatusCodes.BAD_REQUEST, true);
        }
        console.log("get the admon user ====================", admin);
        const { url: image_url } = await uploadImage(req.file?.path as string);

        console.log("this is the image url =====================", image_url);
        
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
              image: image_url,
            },
          });
          console.log("update product category=====================", productCategory);
        } else {
          productCategory = await prisma.category.create({
            data: {
              name: name,
              image: image_url,
            },
          });
        }
        console.log("created product categhory=====================", productCategory);
        
        res.status(StatusCodes.OK).json({
          productCategory,
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

export const createOrUpdateProduct = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const errors = validationResult(req.params);

    if (!errors.isEmpty()) {
      throwError("Invalid inputs", StatusCodes.BAD_REQUEST, true);
    }

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
    } = req.params;

    const authId = req.authId;

    try {
      if ("file" in req) {
        if (!req.path) {
          throwError("file is requiered", StatusCodes.BAD_REQUEST, true);
        }

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
        const { url: image_url } = await uploadImage(req.file?.path as string);

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
   
    const { name, productId } = req.params;

    

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
          product: {
            connect: { id: productId },
          },
        },
      });
      res.status(StatusCodes.CREATED).json({
        message: "product added successfully",
        size,
      });
    } catch (error) {
      next(error);
    }
  }
);
export const createOrUpdateClothColor = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const errors = validationResult(req.params);

    if (!errors.isEmpty()) {
      throwError("Invalid inputs", StatusCodes.BAD_REQUEST, true);
    }
    const authId = req.authId;
    try {
      if ("file" in req) {
        if (!req.path) {
          throwError("file is requiered", StatusCodes.BAD_REQUEST, true);
        }
        const { name, price, discount, colorId, sizeId, sales_price } =
          req.params;
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
        const { url: image_url } = await uploadImage(req.file?.path as string);
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
              sales_price:Number(sales_price),
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
              sales_price:Number(sales_price),
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
      }
    } catch (error) {
      next(error);
    }
  }
);

export const getCategory = expressAsyncHandler(async (req, res, next) => {
  try {
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
