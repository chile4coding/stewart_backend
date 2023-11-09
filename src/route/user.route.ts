import { Router } from "express";

import auth from "../middleware/auth";
import {
  createUser,
  fundWallet,
  getUser,
  loginUser,
  requestOtp,
  resetPassword,
  verifyOtp,
} from "../controller/users/user.controller";
import { body } from "express-validator";
import { payOrderWithWallet } from "../controller/shop/order.controller";
const router = Router();

router.post(
  "/signup",
  [
    body("name").notEmpty(),
    body("password").notEmpty(),
    body("email").isEmail(),
    body("gender").notEmpty(),
    body("dob").isEmail(),
  ],
  createUser
);

router.post("/verify_otp", [body("otp").notEmpty()], verifyOtp);
router.post("/request_otp", [body("email").isEmail()], requestOtp);

router.post(
  "/reset_password",
  [body("email").isEmail(), body("password").notEmpty()],
  resetPassword
);

router.post(
  "/login_user",
  [body("password").notEmpty(), body("email").isEmail()],
  loginUser
);

router.post(
  "/fund_wallet",
  [body("status").notEmpty(), body("amount").notEmpty()],
  fundWallet
);
router.post(
  "/pay_with_wallet",
  auth,
  [
    body("email").notEmpty(),
    body("total").notEmpty(),
    body("name").notEmpty(),
    body("state").notEmpty(),
    body("city").notEmpty(),
    body("address").notEmpty(),
    body("country").notEmpty(),
    body("status").notEmpty(),
    body("shipping").notEmpty(),
    body("phone").notEmpty(),
    body("shippingType").notEmpty(),
  ],
  payOrderWithWallet
);
router.get(
  "/get_user",
  auth,
  getUser
);
export const userRouter = router;
