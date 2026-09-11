import { Worker } from "bullmq";
import { connection } from "../../shared/connection.js";
import { logger } from "../../shared/logger.js";
import { sendEmailService } from "./mail.service.js";
import * as jobRepo from "../../job/job.repository.js";
import { setBatchStatusActiveService, setBatchStatusCompletedService, setBatchStatusFailedService, } from "../../batchJob/batchJob.service.js";
import { WorkerSchema } from "../../shared/zod.schema.js";
export const mailWorker = new Worker("mail", async (job) => {
    const { to, subject, html } = job.data.jobData;
    await sendEmailService({ to, subject, html });
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
    concurrency: 8,
    limiter: { max: 5, duration: 1000 },
});
mailWorker.on("active", (job) => {
    const jobPayload = WorkerSchema.parse(job.data);
    logger.info(`Updating job attempt in MAIL WORKER for ID: ${job.data.dbJobId || job.id}`, "mail.worker");
    Promise.all([
        setBatchStatusActiveService({
            dbJobId: jobPayload.jobId,
            batchId: jobPayload.batchId,
        }),
        jobRepo.updateJobAttempt(jobPayload.jobId),
    ]);
});
mailWorker.on("completed", (job) => {
    const jobPayload = WorkerSchema.parse(job.data);
    setBatchStatusCompletedService({
        dbJobId: jobPayload.jobId,
        batchId: jobPayload.batchId,
        isLastStep: jobPayload.isLastStep,
    });
});
mailWorker.on("failed", (job, err) => {
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
//# sourceMappingURL=mail.worker.js.map