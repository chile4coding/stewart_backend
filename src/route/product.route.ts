import { Router } from "express";

// import { param } from "express-validator";
import {
  getCategory,
  getColors,
  getProduct,
  getSingleProduct,
  getSizes,
} from "../controller/admin/product.controller.admin";
// import auth from "../middleware/auth";
import {
  createOrderWithCard,
  getAllOrder,
  getOrder,
  getUserOrder,
  registeredUserCreateOrder,
  visitorCreateOrder,
} from "../controller/shop/order.controller";
import auth from "../middleware/auth";
import { updateReview } from "../controller/shop/reviews";
const router = Router();
router.get("/get_products", getProduct);
router.get("/get_category", getCategory);
router.get("/get_sizes", getSizes);
router.get("/get_color", getColors);
router.post("/create_order_vistor", visitorCreateOrder);
router.post("/get_track_order", getOrder);
router.post("/get_all_order", auth, getAllOrder);
router.post("/get_user_order", auth, getUserOrder);
router.post("/create_order_user", auth, registeredUserCreateOrder);
router.post("/create_order_user_with_card", auth, createOrderWithCard);
router.post("/create_order_visitor_with_card", createOrderWithCard);
router.post("/update_review", auth, updateReview);

router.get("/product/:id", getSingleProduct);

// ?addmin get items

export const productRoute = router;
