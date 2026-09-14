import configKeys from "./config/config.keys.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./auth/auth.routes.js";
import batchJobRouter from "./batchJob/batchJob.routes.js";
import jobRouter from "./job/job.routes.js";
import benchmarkRouter from "./benchmark/benchmark.routes.js";
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: configKeys.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());
// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));
// Routes
app.use("/api/auth/", authRouter);
app.use("/api/job/", jobRouter);
app.use("/api/batchJob/", batchJobRouter);
app.use("/api/benchmark/", benchmarkRouter);
export default app;
//# sourceMappingURL=app.js.map