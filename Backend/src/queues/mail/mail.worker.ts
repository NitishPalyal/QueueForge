import { Worker } from "bullmq";
import { connection } from "../../shared/connection.ts";
import { logger } from "../../shared/logger.ts";
import { sendEmailService } from "./mail.service.ts";
import * as jobRepo from "../../job/job.repository.ts";
import { finishStepService } from "../../batchJob/batchJob.service.ts";
import { WorkerSchema } from "../../shared/zod.schema.ts";

export const mailWorker = new Worker(
  "mail",
  async (job) => {
    // Extract email data from canonical jobData structure
    const { to, subject, html } = (job.data as any).jobData;
    await sendEmailService({ to, subject, html });
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
    concurrency: 8,
    limiter: { max: 5, duration: 1000 },
  },
);

mailWorker.on("active", (job) => {
  const jobPayload = WorkerSchema.parse(job.data);
  const jobId = String(job.id);
  logger.info(
    `Updating job attempt in MAIL WORKER for ID: ${job.data.dbJobId || (job.id as string)}`,
    "mail.worker",
  );
  Promise.all([
    jobRepo.setStatusActive(jobPayload.dbJobId || jobId),
    jobRepo.updateJobAttempt(jobPayload.dbJobId || jobId),
  ]);
});

mailWorker.on("completed", (job) => {
  const jobPayload = WorkerSchema.parse(job.data);
  const jobId = String(job.id);
  finishStepService({
    dbJobId: jobPayload.dbJobId || jobId,
    batchId: jobPayload.batchId,
    isLastStep: jobPayload.isLastStep,
  });
});

mailWorker.on("failed", (job, err) => {
  if (job) {
    const jobPayload = WorkerSchema.parse(job.data);
    const jobId = String(job.id);
    jobRepo.setStatusFailed(
      jobPayload.dbJobId || jobId,
      err instanceof Error ? err.message : String(err),
    );
  }
});
