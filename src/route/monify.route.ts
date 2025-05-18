import { Router } from "express";
import { confirmOrder } from "../controller/shop/paystack";

const router = Router();

router.post(
  "/confirm-monify-order-payment",

  confirmOrder
);

export const monifyRoute = router;
