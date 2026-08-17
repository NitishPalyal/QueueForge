import express from "express";
import { userAuthValidator } from "../auth/auth.middleware.ts";
import {
  createBatchJobValidator,
  deleteBatchByIdValidator,
  getBatchJobsByIdValidator,
  uploadImageValidator,
} from "./batchJob.validator.ts";
import upload from "../queues/image/image.config.ts";
import {
  createBatchJobController,
  deleteBatchByIdController,
  getAllBatchesController,
  getBatchJobsByIdController,
  uploadImageController,
} from "./batchJob.controller.ts";

const batchJobRouter = express.Router();

// GET ALL BATCHES //
batchJobRouter.get(
  "/getAllBatches",
  userAuthValidator,
  getAllBatchesController,
);

// GET BATCH JOBS //
batchJobRouter.get(
  "/getBatchJobs/:id",
  userAuthValidator,
  getBatchJobsByIdValidator,
  getBatchJobsByIdController,
);

// CREATE BATCH JOB //
batchJobRouter.post(
  "/createBatchJob/",
  userAuthValidator,
  createBatchJobValidator,
  createBatchJobController,
);

// UPLOAD IMAGE //
batchJobRouter.post(
  "/uploadImage/",
  userAuthValidator,
  upload.single("image"),
  uploadImageValidator,
  uploadImageController,
);

// DELETE BATCH //
batchJobRouter.delete(
  "/deleteBatch/:id",
  userAuthValidator,
  deleteBatchByIdValidator,
  deleteBatchByIdController,
);

export default batchJobRouter;
