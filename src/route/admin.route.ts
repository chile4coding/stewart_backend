import { Router } from "express";
import {
  createCategory,
  createOrUpdateClothColor,
  createOrUpdateProduct,
  createOrUpdateSize,
} from "../controller/admin/product.controller.admin";
import { createAdmin, loginAdmin } from "../controller/admin/admin.controller";

import { param, body, check } from "express-validator";

import auth from "../middleware/auth";
const router = Router();

router.post(
  "/create_admin",
  [check("email").isEmail().isEmpty(), check("password").isEmpty()],
  createAdmin
);
router.post(
  "/login_admin",
  [check("email").isEmail().isEmpty(), check("password").isEmpty()],
  loginAdmin
);

router.post(
  "/create_category",
  [check("name").isEmpty(), check("productImage")],
  auth,
  createCategory
);

router.post(
  "/create_product",
  auth,

  createOrUpdateProduct
);
router.post("/create_size", auth, createOrUpdateSize);
router.post(
  "/create_cloth_color",
  auth,

  createOrUpdateClothColor
);

export const adminRoute = router;
