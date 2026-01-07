import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
dotenv.config();

import userRoute from "./routes/user.routes"

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok" });
});

app.use("/api/v1/user", userRoute)

export default app;
