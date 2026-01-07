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
    sendEmailVerification,
    verifyEmailOtp,
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

// email verification
router.post("/email/verify/send", protect, sendEmailVerification);
router.post("/email/verify/confirm", protect, verifyEmailOtp);


// admin route
router.get("/users", protect, isAdmin, getAllUsers);

export default router;
