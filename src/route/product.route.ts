import { Router } from "express";

// import { param } from "express-validator";
import {
  getCategory,
  getColors,
  getProduct,
  getSizes,
} from "../controller/admin/product.controller.admin";
// import auth from "../middleware/auth";
import {
    getAllOrder,
    getOrder,
  getUserOrder,
  registeredUserCreateOrder,
  visitorCreateOrder,
} from "../controller/shop/order.controller";
import auth from "../middleware/auth";
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

export const productRoute = router;
