import { Router } from "express";

// import { param } from "express-validator";
import { getCategory, getColors, getProduct, getSizes } from "../controller/admin/product.controller.admin";
// import auth from "../middleware/auth";
const router = Router();

router.get("/get_products", getProduct);
router.get("/get_category", getCategory);
router.get("/get_sizes", getSizes);
router.get("/get_color", getColors);



export const productRoute = router;
