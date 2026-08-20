import express from "express";
import { userAuthValidator } from "../auth/auth.middleware.ts";
import {
  createBatchJobValidator,
  deleteBatchByIdValidator,
  deleteImageValidator,
  getBatchJobsByIdValidator,
  uploadImageValidator,
} from "./batchJob.validator.ts";
import upload from "../queues/image/image.config.ts";
import {
  createBatchJobController,
  deleteBatchByIdController,
  deleteImageController,
  getAllBatchesController,
  getBatchJobsByIdController,
  uploadImageController,
} from "./batchJob.controller.ts";
import {
  dbOperationRateLimiter,
  jobCreationRateLimiter,
} from "../job/job.rateLimiters.ts";

const batchJobRouter = express.Router();

// GET ALL BATCHES //
batchJobRouter.get(
  "/getAllBatches",
  userAuthValidator,
  dbOperationRateLimiter,
  getAllBatchesController,
);

// GET BATCH JOBS //
batchJobRouter.get(
  "/getBatchJobs/:id",
  userAuthValidator,
  dbOperationRateLimiter,
  getBatchJobsByIdValidator,
  getBatchJobsByIdController,
);

// CREATE BATCH JOB //
batchJobRouter.post(
  "/createBatchJob/",
  userAuthValidator,
  jobCreationRateLimiter,
  createBatchJobValidator,
  createBatchJobController,
);

// UPLOAD IMAGE IN STORAGE //
batchJobRouter.post(
  "/uploadImage/",
  userAuthValidator,
  upload.single("image"),
  uploadImageValidator,
  uploadImageController,
);

// DELETE IMAGE FROM STORAGE //
batchJobRouter.post(
  "/deleteImage/",
  userAuthValidator,
  deleteImageValidator,
  deleteImageController,
);

// DELETE BATCH //
batchJobRouter.delete(
  "/deleteBatch/:id",
  userAuthValidator,
  dbOperationRateLimiter,
  deleteBatchByIdValidator,
  deleteBatchByIdController,
);

export default batchJobRouter;
