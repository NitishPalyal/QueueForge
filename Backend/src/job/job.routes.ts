import { Router } from "express";
import upload from "../queues/image/image.config.ts";
import { userAuthValidator } from "../auth/auth.middleware.ts";
import {
  createAiResponseJobController,
  createEmailJobController,
  createImageProcessingJobController,
  deleteJobByQueueAndIdController,
  getAllJobsByQueueAndStatusController,
  getAllJobsByQueueController,
  getAllJobsByStatusController,
  getAllJobsController,
  getJobByIdController,
  getJobStatusByIdController,
  retryJobByQueueAndIdController,
} from "./job.controller.ts";
import {
  createAiResponseJobValidator,
  createEmailJobValidator,
  createImageProcessingJobValidator,
  deleteJobByQueueAndIdValidator,
  getAllJobsByQueueAndStatusValidator,
  getAllJobsByQueueValidator,
  getAllJobsByStatusValidator,
  getJobByIdValidator,
  getJobStatusByIdValidator,
  retryJobByQueueAndIdValidator,
} from "./job.validator.ts";
import {
  expensiveRateLimiter,
  generalRateLimiter,
} from "./job.rateLimiters.ts";

const jobRouter = Router();
// CREATE MAIL JOB //
jobRouter.post(
  "/sendMail",
  expensiveRateLimiter,
  userAuthValidator,
  createEmailJobValidator,
  createEmailJobController,
);

// CREATE AI RESPONSE JOB //
jobRouter.post(
  "/aiReponse",
  expensiveRateLimiter,
  userAuthValidator,
  createAiResponseJobValidator,
  createAiResponseJobController,
);

// CREATE IMAGE PROCESSING JOB //
jobRouter.post(
  "/imageProcessing",
  expensiveRateLimiter,
  userAuthValidator,
  createImageProcessingJobValidator,
  upload.single("image"),
  createImageProcessingJobController,
);

// GET ALL JOBS //
jobRouter.get(
  "/getAllJobs",
  userAuthValidator,
  generalRateLimiter,
  getAllJobsController,
);

// GET JOB/:ID //
jobRouter.get(
  "/getJob/:id",
  userAuthValidator,
  generalRateLimiter,
  getJobByIdValidator,
  getJobByIdController,
);

// DELETE JOB /:QUEUE/:ID //
jobRouter.delete(
  "/deleteJob/:queue/:id",
  userAuthValidator,
  generalRateLimiter,
  deleteJobByQueueAndIdValidator,
  deleteJobByQueueAndIdController,
);

// GET JOB STATUS/:ID //
jobRouter.get(
  "/getJobStatus/:id",
  userAuthValidator,
  getJobStatusByIdValidator,
  getJobStatusByIdController,
);

// GET ALL /:QUEUE JOBS //
jobRouter.get(
  "/getAll/:queue/Jobs",
  userAuthValidator,
  generalRateLimiter,
  getAllJobsByQueueValidator,
  getAllJobsByQueueController,
);

// GET ALL /:STATUS JOBS //
jobRouter.get(
  "/getAll/:status/Statusjobs",
  userAuthValidator,
  generalRateLimiter,
  getAllJobsByStatusValidator,
  getAllJobsByStatusController,
);

// GET ALL /:QUEUE/:STATUS JOBS //
jobRouter.get(
  "/getAll/:queue/:status/jobs",
  userAuthValidator,
  generalRateLimiter,
  getAllJobsByQueueAndStatusValidator,
  getAllJobsByQueueAndStatusController,
);

//RETRY JOB /:QUEUE/:ID//
jobRouter.get(
  "/retryJob/:id/:queue",
  expensiveRateLimiter,
  userAuthValidator,
  retryJobByQueueAndIdValidator,
  retryJobByQueueAndIdController,
);

export default jobRouter;
