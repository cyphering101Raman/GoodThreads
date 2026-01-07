import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    updateProfile,
    changePassword,
    deleteAccount,
    getAllUsers,
} from "../controllers/user.controller";
import { protect } from "../middlewares/user.middleware";
import { isAdmin } from "../middlewares/admin.middleware";

const router = Router();

// basic route
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser);

// user routes
router.get("/me", protect, getCurrentUser);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.delete("/delete-account", protect, deleteAccount);

// admin route
router.get("/users", protect, isAdmin, getAllUsers);

export default router;
