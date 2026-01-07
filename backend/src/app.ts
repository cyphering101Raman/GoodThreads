import express, {Request, Response} from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok" });
});

export default app;
