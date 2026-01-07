import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import http from "http";
import connectDB from "./config/db";


const PORT = process.env.BACKEND_PORT || 5000;

const startServer = async () => {
    await connectDB();
    const server = http.createServer(app);

    server.listen(PORT, () => {
        console.log(`Server is up and running on port ${PORT}`);
    });
};

startServer().catch((err) => {
    console.error("Error while starting the server", err);
    process.exit(1);
});


