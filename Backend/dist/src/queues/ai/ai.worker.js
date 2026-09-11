import { Worker } from "bullmq";
import { connection } from "../../shared/connection.js";
import { logger } from "../../shared/logger.js";
import * as jobRepo from "../../job/job.repository.js";
import { generateAiResponseForEmailService, generateAiResponseService, } from "./ai.service.js";
import { setBatchStatusActiveService, setBatchStatusCompletedService, setBatchStatusFailedService, } from "../../batchJob/batchJob.service.js";
import { AiWorkerAiResponseDataSchema, AiWorkerEmailServiceDataSchema, } from "./ai.zodSchema.js";
import { WorkerSchema } from "../../shared/zod.schema.js";
/**
 * AI Worker processes jobs from the AI queue.
 *
 * Handles two job types:
 * - Email jobs: Generate subject/HTML for a targeted recipient
 * - Response jobs: Generate AI content for a given prompt
 *
 * All jobs follow the canonical queue payload structure with jobData + metadata.
 */
export const aiWorker = new Worker("ai", async (job) => {
    // Determine if this is an email job or standard AI response job
    const isMail = job.data.isMail === true;
    if (isMail) {
        const jobPayload = AiWorkerEmailServiceDataSchema.parse(job.data);
        await generateAiResponseForEmailService({
            prompt: jobPayload.jobData.prompt,
            to: jobPayload.jobData.to,
            jobId: jobPayload.jobId,
            batchId: jobPayload.batchId,
            isLastStep: jobPayload.isLastStep,
        });
    }
    else {
        const jobPayload = AiWorkerAiResponseDataSchema.parse(job.data);
        await generateAiResponseService({
            jobId: jobPayload.jobId,
            prompt: jobPayload.jobData.prompt,
        });
    }
}, {
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
});
aiWorker.on("active", (job) => {
    const jobPayload = WorkerSchema.parse(job.data);
    logger.info(`Updating job attempt in AI WORKER for ID: ${job.data.dbJobId || job.id}`, "ai.worker");
    Promise.all([
        setBatchStatusActiveService({
            dbJobId: jobPayload.jobId,
            batchId: jobPayload.batchId,
        }),
        jobRepo.updateJobAttempt(jobPayload.jobId),
    ]);
});
aiWorker.on("completed", (job) => {
    if (job.data.isMail)
        return;
    const jobPayload = WorkerSchema.parse(job.data);
    setBatchStatusCompletedService({
        dbJobId: jobPayload.jobId,
        batchId: jobPayload.batchId,
        isLastStep: jobPayload.isLastStep,
    });
});
aiWorker.on("failed", (job, err) => {
    if (job) {
        const jobPayload = WorkerSchema.parse(job.data);
        const jobId = String(job.id);
        setBatchStatusFailedService({
            dbJobId: jobPayload.jobId,
            batchId: jobPayload.batchId,
            isLastStep: jobPayload.isLastStep,
            error: err instanceof Error ? err.message : String(err),
        });
    }
});
//# sourceMappingURL=ai.worker.js.map