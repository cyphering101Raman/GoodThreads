import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv"
dotenv.config();

import userRoute from "./routes/user.routes"
import adminRoute from "./routes/admin.routes"
import productRoutes from "./routes/product.routes"

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok" });
});

app.use("/api/v1/user", userRoute)
app.use("/api/v1/admin", adminRoute)
app.use("/api/v1/products", productRoutes);

export default app;
