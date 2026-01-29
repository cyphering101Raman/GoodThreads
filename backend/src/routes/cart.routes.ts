import { Router } from "express";
import {
    getCart,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
} from "../controllers/cart.controller";
import { protect } from "../middlewares/user.middleware";

const router = Router();

router.get("/", protect, getCart);
router.post("/add", protect, addItemToCart);
router.patch("/item", protect, updateCartItem);
router.delete("/item", protect, removeCartItem);
router.delete("/clear", protect, clearCart);

export default router;
