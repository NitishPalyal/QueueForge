import express from "express";
import upload from "../queues/image/image.config.js";
import { userAuthValidator } from "../auth/auth.middleware.js";
import { createEmailJobController, createAiResponseJobController, createImageProcessingJobController, } from "../job/job.controller.js";
import { createEmailJobValidator, createAiResponseJobValidator, createImageProcessingJobValidator, } from "../job/job.validator.js";
import { getBatchJobBenchmarkController, getJobBenchmarkController, } from "./benchmark.controller.js";
import { getBenchmarkControllerValidator } from "./benchmark.validator.js";
import { createBatchJobValidator } from "../batchJob/batchJob.validator.js";
import { createBatchJobController } from "../batchJob/batchJob.controller.js";
// Same controllers, same validators, same behavior as src/job/job.routes.ts —
// the ONLY difference is jobCreationRateLimiter is not in this chain.
// This is what benchmark.service.ts actually points its load test at.
const benchmarkRouter = express.Router();
benchmarkRouter.post("/getJobBenchmark/:jobType", userAuthValidator, getBenchmarkControllerValidator, getJobBenchmarkController);
benchmarkRouter.post("/sendMail", userAuthValidator, createEmailJobValidator, createEmailJobController);
benchmarkRouter.post("/aiReponse", userAuthValidator, createAiResponseJobValidator, createAiResponseJobController);
benchmarkRouter.post("/imageProcessing", userAuthValidator, createImageProcessingJobValidator, upload.single("image"), createImageProcessingJobController);
benchmarkRouter.post("/getBatchJobBenchmark", userAuthValidator, getBatchJobBenchmarkController);
benchmarkRouter.post("/createBatchJob", userAuthValidator, createBatchJobValidator, createBatchJobController);
export default benchmarkRouter;
//# sourceMappingURL=benchmark.routes.js.map