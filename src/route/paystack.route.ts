import { Router } from "express";
import { body, check } from "express-validator";
import { fundWallet, verifyPayment } from "../controller/shop/paystack";
import auth from "../middleware/auth";

// import { param } from "express-validator";
// import { paystack } from "../controller/shop/paystack";
// import auth from "../middleware/auth";
const router = Router();

router.post(
  "/fund_wallet",
  [
    check("email").isEmail().notEmpty(),
    body("amount").notEmpty(),
    body("name").notEmpty(),
  ],
  auth,
  fundWallet
);
router.get("/verify_payment", verifyPayment);

export const paystackRoute = router;
