import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

import { connectRedis } from "./config/redis.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import statusRoutes from "./routes/status.routes.js";
import { scheduleStatusCleanup } from "./jobs/statusCleanup.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/ping", (_req: Request, res: Response) => {
    res.json({ message: "pong" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/statuses", statusRoutes);

app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Route not found" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
});

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI ?? "mongodb://localhost:27017/tot";

mongoose
    .connect(MONGO_URI)
    .then(async () => {
        console.log("MongoDB connected");
        await connectRedis();
        scheduleStatusCleanup();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err: Error) => {
        console.error("MongoDB connection failed:", err.message);
        process.exit(1);
    });

export default app;
