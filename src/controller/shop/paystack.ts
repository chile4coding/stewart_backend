import expressAsyncHandler from "express-async-handler";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { throwError } from "../../helpers";
import dotenv from "dotenv";
import prisma from "../../configuration/prisma-client";
dotenv.config();

export const paystack = expressAsyncHandler(async (req, res, next) => {
  const errors = validationResult(req.body);
  if (!errors.isEmpty()) {
    throwError("Inavlid inputs", StatusCodes.BAD_REQUEST, true);
  }
  const {
    email,
    amount,
    userId,
    order,
    name,
    state,
    city,
    address,
    country,
    shipping,
    phone,
  } = req.body;
  const https = require("https");
  const params = JSON.stringify({
    email: email,
    amount: `${Number(amount) * 100}`,
  });

  const options = {
    hostname: process.env.paystackHostname,
    port: process.env.paystackPort,
    path: process.env.paystackPath,
    method: process.env.paystackMethod,
    headers: {
      Authorization: process.env.paystackAuthization,
      "Content-Type": "application/json",
    },
  };
  const reqPaystack = https
    .request(options, (resPaystack: any) => {
      let data = "";

      resPaystack.on("data", (chunk: any) => {
        data += chunk;
      });

      resPaystack.on("end", async () => {
        const finalData = JSON.parse(data);
        const { authorization_url, reference } = finalData.data;
        let newOrder;

        if (Boolean(userId)) {
          newOrder = await prisma.order.create({
            data: {
              refNo: reference,
              orderitem: JSON.stringify(order),
              total: amount,
              tax: 0,
              shipping,
              phone,
              city,
              address,
              country,
              name,
              state,
              arrivalDate: `${new Date().getDate() + 4}`,
              user: { connect: { id: userId } },
            },
          });
        } else {
          newOrder = await prisma.order.create({
            data: {
              refNo: reference,
              orderitem: order,
              total: Number(amount),
              tax: 0,
              shipping,
              phone,
              city,
              address,
              country,
              name,
              state,

              arrivalDate: `${new Date().getDate() + 4}`,
            },
          });
        }
        res.status(StatusCodes.OK).json({
          data: {
            authorization_url,
            newOrder,
          },
        });
      });
    })
    .on("error", (error: any) => {
      console.error(error);
    });

  reqPaystack.write(params);
  reqPaystack.end();
});

export const verifyPayment = expressAsyncHandler(async (req, res, next) => {
  const reference = req.query.reference;
  const https = require("https");
  const options = {
    hostname: process.env.paystackHostname,
    port: process.env.paystackPort,
    path: `/transaction/verify/:${reference}`,
    method: "GET",
    headers: {
      Authorization: process.env.paystackAuthization,
    },
  };

  https
    .request(options, (resPaystack: any) => {
      let data = "";

      res.on("data", (chunk: any) => {
        data += chunk;
      });
      const finalData = JSON.parse(data);
      const { status, reference } = finalData.data;

      res.on("end", async () => {
        let confirmOrder;
        confirmOrder = await prisma.order.findFirst({
          where: {
            refNo: reference,
          },
        });

        if (confirmOrder && confirmOrder.status === "success") {
          confirmOrder = await prisma.order.update({
            where: { id: confirmOrder.id },
            data: {
              status: status,
            },
          });
        }

        res.status(StatusCodes.OK).json({
          finalData,
          confirmOrder,
        });
      });
    })
    .on("error", (error: any) => {
      console.error(error);
    });
});
