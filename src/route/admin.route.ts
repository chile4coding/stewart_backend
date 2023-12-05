import { Router } from "express";
import {
  checkVisitor,
  createCategory,
  createOrUpdateClothColor,
  createOrUpdateProduct,
  createOrUpdateSize,
  deletekVisitor,
  removeAProduct,
  removeAProductColor,
} from "../controller/admin/product.controller.admin";
import { adminGetAllUsers, adminGraph, createAdmin, getVistors, loginAdmin } from "../controller/admin/admin.controller";

import { param, body, check } from "express-validator";

import auth from "../middleware/auth";
import { adminMessage, deleteMessage, deleteNotification, getMessages, getNotifications, sendMessage } from "../controller/shop/message.controller";
import { getAdminOrder, getAdminReviews } from "../controller/shop/order.controller";
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
router.delete(
  "/delete_product",
  [body("productId").isEmpty()],
  auth,
  removeAProduct
);
router.delete(
  "/delete_color",
  [body("productColorId").isEmpty()],
  auth,
  removeAProductColor
);
router.post(
  "/create_cloth_color",
  auth,

  createOrUpdateClothColor
);
router.post(
  "/create_message",
  auth,
  sendMessage
);
router.get(
  "/get_messages",
  auth,
  getMessages
);
router.delete(
  "/messages",
  auth,
  deleteMessage
);
router.delete(
  "/notification",
  auth,
  deleteNotification
);
router.get(
  "/get_notification",
  auth,
 getNotifications
);
router.get(
  "/admin_get_message",
  auth,
 adminMessage
);

router.get("/admin_get_orders",auth, getAdminOrder )
router.get("/admin_get_reviews",auth, getAdminReviews )
router.get("/get_customers", auth, adminGetAllUsers);
router.get("/get_visitors", auth, getVistors);
router.delete("/delete_visitors",  deletekVisitor);
router.post("/visitor", checkVisitor);
router.get("/admin_graph",auth, adminGraph);

export const adminRoute = router;
