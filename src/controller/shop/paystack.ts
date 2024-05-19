import expressAsyncHandler from "express-async-handler";
import paystack from "paystack";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { throwError } from "../../helpers";
import dotenv from "dotenv";
import prisma from "../../configuration/prisma-client";
const Paystack = paystack(process.env.paystackAuthization + "");
dotenv.config();

export const verifyPayment = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const { reference } = req.query;
    try {
      if (!Boolean(reference)) {
        throwError("Invalid Input", StatusCodes.BAD_REQUEST, true);
      }

      const verifyPay = await Paystack?.transaction?.verify(
        reference as string
      );

      if (verifyPay?.data.status === "success") {
        const amount = Number(verifyPay.data.amount);
        const amountN = Number((amount / 100).toFixed(2));
        const walletAmount = await prisma.wallet.findUnique({
          where: { transactionref: reference },
        });
        const oldAmount = Number(walletAmount?.amount);
        const currentAmount = oldAmount + amountN;
        await prisma.wallet.update({
          where: { id: walletAmount?.id },
          data: {
            amount: currentAmount,
          },
        });
        res.redirect("https://www.stewartcollection.store/my_account");
      } else {
        throwError("payment failed", StatusCodes.BAD_REQUEST, true);
      }
    } catch (error) {
      next(error);
    }
  }
);

export const fundWallet = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      throwError("Invalid input valid  ", StatusCodes.BAD_REQUEST, true);
    }
    const { email, amount, name } = req.body;
    const { authId } = req;
    function generateUniqueReferenceNumber() {
      const timestamp = Date.now();
      const randomNumber = Math.random().toString().slice(2);
      const referenceNumber = `${timestamp}${randomNumber}`;
      return referenceNumber;
    }
    try {
      const initPayment = await Paystack.transaction.initialize({
        name: name,
        amount: Number(amount) * 100,
        email: email,
        reference: `${generateUniqueReferenceNumber()}`,
        callback_url: "https://stewart-r0co.onrender.com/api/v1/verify_payment",
        authorization: `Bearer ${process.env.paystackAuthization}`,
      });

      await prisma.wallet.update({
        where: { user_id: authId },
        data: {
          transactionref: initPayment?.data?.reference,
        },
      });
      res.status(StatusCodes.OK).json({
        data: initPayment.data.authorization_url,
      });
    } catch (error) {
      next(error);
    }
  }
);
