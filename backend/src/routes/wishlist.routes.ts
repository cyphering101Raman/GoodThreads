import { Router } from "express";
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
} from "../controllers/wishlist.controller";
import { protect } from "../middlewares/user.middleware";

const router = Router();
router.get("/", protect, getWishlist);
router.post("/add", protect, addToWishlist);
router.delete("/item", protect, removeFromWishlist);
router.delete("/clear", protect, clearWishlist);

export default router;
