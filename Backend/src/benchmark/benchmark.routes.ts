import express from "express";
import upload from "../queues/image/image.config.ts";
import { userAuthValidator } from "../auth/auth.middleware.ts";
import {
  createEmailJobController,
  createAiResponseJobController,
  createImageProcessingJobController,
} from "../job/job.controller.ts";
import {
  createEmailJobValidator,
  createAiResponseJobValidator,
  createImageProcessingJobValidator,
} from "../job/job.validator.ts";
import { getBenchmarkController } from "./benchmark.controller.ts";
import { getBenchmarkControllerValidator } from "./benchmark.validator.ts";

// Same controllers, same validators, same behavior as src/job/job.routes.ts —
// the ONLY difference is jobCreationRateLimiter is not in this chain.
// This is what benchmark.service.ts actually points its load test at.
const benchmarkRouter = express.Router();

benchmarkRouter.post(
  "/getBenchmark/:jobType",
  userAuthValidator,
  getBenchmarkControllerValidator,
  getBenchmarkController,
);

benchmarkRouter.post(
  "/sendMail",
  userAuthValidator,
  createEmailJobValidator,
  createEmailJobController,
);

benchmarkRouter.post(
  "/aiReponse",
  userAuthValidator,
  createAiResponseJobValidator,
  createAiResponseJobController,
);

benchmarkRouter.post(
  "/imageProcessing",
  userAuthValidator,
  createImageProcessingJobValidator,
  upload.single("image"),
  createImageProcessingJobController,
);

export default benchmarkRouter;
