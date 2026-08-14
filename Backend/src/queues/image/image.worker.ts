import { Worker } from "bullmq";
import { connection } from "../../shared/connection.ts";
import os from "node:os";
import { logger } from "../../shared/logger.ts";

import * as jobRepo from "../../job/job.repository.ts";
import { imageProcessingService } from "./image.service.ts";
import { finishStepService } from "../../batchJob/batchJob.service.ts";
import { WorkerSchema } from "../../shared/zod.schema.ts";
import { ImageWorkerProcessingServiceDataSchema } from "./image.zodSchema.ts";

export const imageWorker = new Worker(
  "image",
  async (job) => {
    const jobId = job.id;

    if (!jobId) {
      throw new Error("Missing job id in image worker");
    }
    const jobPayload = ImageWorkerProcessingServiceDataSchema.parse(job.data);
    await imageProcessingService({
      jobId: jobPayload.dbJobId || jobId,
      uploadedImageKey: jobPayload.jobData.uploadedImageKey,
    });
  },
  {
    connection,
    removeOnComplete: {
      age: 3600, // 1 hour
      count: 1000,
    },
    removeOnFail: {
      age: 604800, // 7 days
      count: 5000,
    },
    concurrency: Math.max(1, os.cpus().length - 1),
    useWorkerThreads: true,
  },
);

imageWorker.on("active", (job) => {
  const jobPayload = WorkerSchema.parse(job.data);
  const jobId = String(job.id);
  logger.info(
    `Updating job attempt in IMAGE WORKER for ID: ${job.data.dbJobId || (job.id as string)}`,
    "image.worker",
  );
  Promise.all([
    jobRepo.setStatusActive(jobPayload.dbJobId || jobId),
    jobRepo.updateJobAttempt(jobPayload.dbJobId || jobId),
  ]);
});

imageWorker.on("completed", (job) => {
  const jobPayload = WorkerSchema.parse(job.data);
  const jobId = String(job.id);
  finishStepService({
    dbJobId: jobPayload.dbJobId || jobId,
    batchId: jobPayload.batchId,
    isLastStep: jobPayload.isLastStep,
  });
});

imageWorker.on("failed", (job, err) => {
  if (job) {
    const jobPayload = WorkerSchema.parse(job.data);
    const jobId = String(job.id);
    jobRepo.setStatusFailed(
      jobPayload.dbJobId || jobId,
      err instanceof Error ? err.message : String(err),
    );
  }
});
