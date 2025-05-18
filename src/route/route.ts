import { Router } from "express";
import { adminRoute } from "./admin.route";
import { productRoute } from "./product.route";
import { paystackRoute } from "./paystack.route";
import { userRouter } from "./user.route";
import { monifyRoute } from "./monify.route";
const router = Router();

router.use("/api/v1", adminRoute);
router.use("/api/v1", productRoute);
router.use("/api/v1", paystackRoute);
router.use("/api/v1", userRouter);
router.use("/api/v1", monifyRoute);
export default router;
