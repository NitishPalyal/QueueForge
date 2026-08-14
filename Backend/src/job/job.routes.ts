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
} from "./job.validator.ts";

const jobRouter = Router();
// CREATE MAIL JOB //
jobRouter.post(
  "/sendMail",
  userAuthValidator,
  createEmailJobValidator,
  createEmailJobController,
);

// CREATE AI RESPONSE JOB //
jobRouter.post(
  "/aiReponse",
  userAuthValidator,
  createAiResponseJobValidator,
  createAiResponseJobController,
);

// CREATE IMAGE PROCESSING JOB //
jobRouter.post(
  "/imageProcessing",
  userAuthValidator,
  createImageProcessingJobValidator,
  upload.single("image"),
  createImageProcessingJobController,
);

// GET ALL JOBS //
jobRouter.get("/getAllJobs", userAuthValidator, getAllJobsController);

// GET JOB/:ID //
jobRouter.get(
  "/getJob/:id",
  userAuthValidator,
  getJobByIdValidator,
  getJobByIdController,
);

// DELETE JOB /:QUEUE/:ID //
jobRouter.delete(
  "/deleteJob/:queue/:id",
  userAuthValidator,
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
  getAllJobsByQueueValidator,
  getAllJobsByQueueController,
);

// GET ALL /:STATUS JOBS //
jobRouter.get(
  "/getAll/:status/Statusjobs",
  userAuthValidator,
  getAllJobsByStatusValidator,
  getAllJobsByStatusController,
);

// GET ALL /:QUEUE/:STATUS JOBS //
jobRouter.get(
  "/getAll/:queue/:status/jobs",
  userAuthValidator,
  getAllJobsByQueueAndStatusValidator,
  getAllJobsByQueueAndStatusController,
);

export default jobRouter;
