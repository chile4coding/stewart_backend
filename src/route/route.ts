import { Router } from "express";
import { adminRoute } from "./admin.route";
import { productRoute } from "./product.route";
import { paystackRoute } from "./paystack.route";
const router = Router();

router.use("/api/v1", adminRoute);
router.use("/api/v1", productRoute);
router.use("/api/v1", paystackRoute);
export default router;
