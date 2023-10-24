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
  "/create_product/:categoryId/:name/:price/:salesPrice/:discount/:initialSize/:initialColor/:description/:image_url/:productId",
  auth,

  createOrUpdateProduct
);
router.post("/create_size/:name/:productId", auth, createOrUpdateSize);
router.post(
  "/create_cloth_color/:name/:price/:discount/:sizeId/:sales_price/:image_url/:colorId",
  auth,

  createOrUpdateClothColor
);

export const adminRoute = router;
