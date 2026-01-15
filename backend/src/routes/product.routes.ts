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
import { upload } from "../middlewares/upload.middleware";

const router = Router();

// Protected Admin Routes
// router.post("/create", protect, isAdmin, upload.fields([
//     { name: "images", maxCount: 6 },
//     { name: "thumbnail", maxCount: 3 },
// ]), createProduct);

router.post("/create", protect, isAdmin, (req, res, next) => {
    upload.fields([
        { name: "images", maxCount: 6 },
        { name: "thumbnail", maxCount: 3 }
    ])(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({
                message: err.message || "File upload failed"
            });
        }
        next();
    });
}, createProduct);

router.put("/:id", protect, isAdmin, updateProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);
router.patch("/:id/featured", protect, isAdmin, toggleFeaturedProduct);
router.patch("/:id/stock", protect, isAdmin, updateVariantStock);

// Public User Routes
router.get("/", getAllProducts);
router.get("/:slug", getProductBySlug);

export default router;


