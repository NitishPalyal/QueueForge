import { Worker } from "bullmq";
import { connection } from "../../shared/connection.js";
import os from "node:os";
import { logger } from "../../shared/logger.js";
import * as jobRepo from "../../job/job.repository.js";
import { setBatchStatusCompletedService, setBatchStatusFailedService, } from "../../batchJob/batchJob.service.js";
import { WorkerSchema } from "../../shared/zod.schema.js";
import path from "node:path";
export const imageWorker = new Worker("image", path.join(process.cwd(), "src", "queues", "image", "image.processor.ts"), {
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
});
imageWorker.on("active", (job) => {
    const jobPayload = WorkerSchema.parse(job.data);
    logger.info(`Updating job attempt in IMAGE WORKER for ID: ${job.data.dbJobId || job.id}`, "image.worker");
    Promise.all([
        jobRepo.setStatusActive(jobPayload.jobId),
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
//# sourceMappingURL=image.worker.js.map