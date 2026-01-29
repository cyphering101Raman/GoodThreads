import { Router } from "express";
import {
    createOrder,
    getMyOrders,
    getOrderById,
    updatePaymentStatus,
    updateOrderStatus,
} from "../controllers/order.controller";
import { protect } from "../middlewares/user.middleware";
import { isAdmin } from "../middlewares/admin.middleware";

const router = Router();
router.post("/", protect, createOrder);
router.get("/", protect, getMyOrders);
router.get("/:orderId", protect, getOrderById);
router.patch("/payment", protect, updatePaymentStatus);


router.patch("/status", protect, isAdmin, updateOrderStatus);

export default router;
