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
  jobCreationRateLimiter,
  dbOperationRateLimiter,
} from "./job.rateLimiters.ts";

const jobRouter = Router();
// CREATE MAIL JOB //
jobRouter.post(
  "/sendMail",
  jobCreationRateLimiter,
  userAuthValidator,
  createEmailJobValidator,
  createEmailJobController,
);

// CREATE AI RESPONSE JOB //
jobRouter.post(
  "/aiReponse",
  jobCreationRateLimiter,
  userAuthValidator,
  createAiResponseJobValidator,
  createAiResponseJobController,
);

// CREATE IMAGE PROCESSING JOB //
jobRouter.post(
  "/imageProcessing",
  jobCreationRateLimiter,
  userAuthValidator,
  createImageProcessingJobValidator,
  upload.single("image"),
  createImageProcessingJobController,
);

// GET ALL JOBS //
jobRouter.get(
  "/getAllJobs",
  userAuthValidator,
  dbOperationRateLimiter,
  getAllJobsController,
);

// GET JOB/:ID //
jobRouter.get(
  "/getJob/:id",
  userAuthValidator,
  dbOperationRateLimiter,
  getJobByIdValidator,
  getJobByIdController,
);

// DELETE JOB /:QUEUE/:ID //
jobRouter.delete(
  "/deleteJob/:queue/:id",
  userAuthValidator,
  dbOperationRateLimiter,
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
  dbOperationRateLimiter,
  getAllJobsByQueueValidator,
  getAllJobsByQueueController,
);

// GET ALL /:STATUS JOBS //
jobRouter.get(
  "/getAll/:status/Statusjobs",
  userAuthValidator,
  dbOperationRateLimiter,
  getAllJobsByStatusValidator,
  getAllJobsByStatusController,
);

// GET ALL /:QUEUE/:STATUS JOBS //
jobRouter.get(
  "/getAll/:queue/:status/jobs",
  userAuthValidator,
  dbOperationRateLimiter,
  getAllJobsByQueueAndStatusValidator,
  getAllJobsByQueueAndStatusController,
);

//RETRY JOB /:QUEUE/:ID//
jobRouter.get(
  "/retryJob/:id/:queue",
  jobCreationRateLimiter,
  userAuthValidator,
  retryJobByQueueAndIdValidator,
  retryJobByQueueAndIdController,
);

export default jobRouter;
