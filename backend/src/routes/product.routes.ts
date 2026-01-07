import { Router } from "express";
import {
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getProductBySlug,
    toggleFeaturedProduct,
    updateVariantStock,
} from "../controllers/product.controller";

import { protect } from "../middlewares/user.middleware";
import { isAdmin } from "../middlewares/admin.middleware";

const router = Router();

// Protected Admin Routes
router.post("/", protect, isAdmin, createProduct);
router.put("/:id", protect, isAdmin, updateProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);
router.patch("/:id/featured", protect, isAdmin, toggleFeaturedProduct);
router.patch("/:id/stock", protect, isAdmin, updateVariantStock);

// Public User Routes
router.get("/", getAllProducts);
router.get("/:slug", getProductBySlug);

export default router;
