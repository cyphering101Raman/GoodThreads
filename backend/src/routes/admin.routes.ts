import { Router } from "express";
import {
    getAllUsers,
} from "../controllers/user.controller";
import { protect } from "../middlewares/user.middleware";
import { isAdmin } from "../middlewares/admin.middleware";

const router = Router();

router.get("/users", protect, isAdmin, getAllUsers);

export default router;
