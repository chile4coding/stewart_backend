import { Router } from "express";
import { check } from "express-validator";

// import { param } from "express-validator";
import { paystack } from "../controller/shop/paystack";
// import auth from "../middleware/auth";
const router = Router();

router.post(
  "/create_payment",
  [check("email").isEmail().isEmpty(), check("amount").isEmpty()],
  paystack
);

export const paystackRoute = router;
