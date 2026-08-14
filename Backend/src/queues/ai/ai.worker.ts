import { Worker } from "bullmq";
import { connection } from "../../shared/connection.ts";
import * as jobRepo from "../../job/job.repository.ts";
import {
  generateAiResponseForEmailService,
  generateAiResponseService,
} from "./ai.service.ts";
import { finishStepService } from "../../batchJob/batchJob.service.ts";
import {
  AiWorkerAiResponseDataSchema,
  AiWorkerEmailServiceDataSchema,
} from "./ai.zodSchema.ts";
import { WorkerSchema } from "../../shared/zod.schema.ts";

/**
 * AI Worker processes jobs from the AI queue.
 *
 * Handles two job types:
 * - Email jobs: Generate subject/HTML for a targeted recipient
 * - Response jobs: Generate AI content for a given prompt
 *
 * All jobs follow the canonical queue payload structure with jobData + metadata.
 */
export const aiWorker = new Worker(
  "ai",
  async (job) => {
    const jobId = job.id;

    if (!jobId) {
      throw new Error("Missing job id in ai worker");
    }

    // Determine if this is an email job or standard AI response job
    const isMail = (job.data as any).isMail === true;

    if (isMail) {
      const jobPayload = AiWorkerEmailServiceDataSchema.parse(job.data);
      await generateAiResponseForEmailService({
        prompt: jobPayload.jobData.prompt,
        to: jobPayload.jobData.to,
        jobId: jobPayload.dbJobId || jobId,
        batchId: jobPayload.batchId,
        isLastStep: jobPayload.isLastStep,
      });
    } else {
      const jobPayload = AiWorkerAiResponseDataSchema.parse(job.data);
      await generateAiResponseService({
        jobId: jobPayload.dbJobId || jobId,
        prompt: jobPayload.jobData.prompt,
      });
    }
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
    concurrency: 3,
    limiter: { max: 5, duration: 1000 },
  },
);

aiWorker.on("active", (job) => {
  const jobPayload = WorkerSchema.parse(job.data);
  const jobId = String(job.id);
  console.log(
    "Updating job attempt in AI WORKER for ID:",
    job.data.dbJobId || (job.id as string),
  );
  Promise.all([
    jobRepo.setStatusActive(jobPayload.dbJobId || jobId),
    jobRepo.updateJobAttempt(jobPayload.dbJobId || jobId),
  ]);
});

aiWorker.on("completed", (job) => {
  const jobPayload = WorkerSchema.parse(job.data);
  const jobId = String(job.id);
  finishStepService({
    dbJobId: jobPayload.dbJobId || jobId,
    batchId: jobPayload.batchId,
    isLastStep: jobPayload.isLastStep,
  });
});

aiWorker.on("failed", (job, err) => {
  if (job) {
    const jobPayload = WorkerSchema.parse(job.data);
    const jobId = String(job.id);
    jobRepo.setStatusFailed(
      jobPayload.dbJobId || jobId,
      err instanceof Error ? err.message : String(err),
    );
  }
});
