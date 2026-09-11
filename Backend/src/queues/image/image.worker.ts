import { Worker } from "bullmq";
import { connection } from "../../shared/connection.ts";
import os from "node:os";
import { logger } from "../../shared/logger.ts";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import * as jobRepo from "../../job/job.repository.ts";
import {
  setBatchStatusActiveService,
  setBatchStatusCompletedService,
  setBatchStatusFailedService,
} from "../../batchJob/batchJob.service.ts";
import { WorkerSchema } from "../../shared/zod.schema.ts";
import path from "node:path";

export const imageWorker = new Worker(
  "image",
  join(
    dirname(fileURLToPath(import.meta.url)),
    existsSync(
      join(dirname(fileURLToPath(import.meta.url)), "image.processor.js"),
    )
      ? "image.processor.js"
      : "image.processor.ts",
  ),
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
  logger.info(
    `Updating job attempt in IMAGE WORKER for ID: ${job.data.dbJobId || (job.id as string)}`,
    "image.worker",
  );
  Promise.all([
    setBatchStatusActiveService({
      dbJobId: jobPayload.jobId,
      batchId: jobPayload.batchId,
    }),
    jobRepo.updateJobAttempt(jobPayload.jobId),
  ]);
});

imageWorker.on("completed", (job) => {
  const jobPayload = WorkerSchema.parse(job.data);

  setBatchStatusCompletedService({
    dbJobId: jobPayload.jobId,
    batchId: jobPayload.batchId,
    isLastStep: jobPayload.isLastStep,
  });
});

imageWorker.on("failed", (job, err) => {
  if (job) {
    const jobPayload = WorkerSchema.parse(job.data);
    setBatchStatusFailedService({
      dbJobId: jobPayload.jobId,
      batchId: jobPayload.batchId,
      isLastStep: jobPayload.isLastStep,
      error: err instanceof Error ? err.message : String(err),
    });
  }
});
