import { Response, NextFunction } from "express";
import { AuthRequest } from "./user.middleware";

export const isAdmin = ( req: AuthRequest, res: Response, next: NextFunction ) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Access denied" });
    }

    next();
};
