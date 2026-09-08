import { deleteFromStorageService, getImageUrlFromStorageService, } from "../queues/image/image.service.js";
import { ImageJobPayloadSchema } from "../shared/zod.schema.js";
import * as jobRepo from "./job.repository.js";
import { logger } from "../shared/logger.js";
import { DEFAULT_JOB_PRIORITY, normalizeJobPriority, QUEUES, } from "./job.types.js";
import { addJobInAiQueueService } from "../queues/ai/ai.service.js";
import { addJobInImageQueueService } from "../queues/image/image.service.js";
export async function createMailJobService({ to, prompt, idempotency_key, priority, }) {
    try {
        const payload = {
            to,
            prompt,
        };
        const normalizedPriority = normalizeJobPriority(priority);
        const input = {
            type: "mail",
            queue_name: "mailQueue",
            payload,
            idempotency_key,
            priority: normalizedPriority,
        };
        const job = await jobRepo.create(input);
        return job;
    }
    catch (error) {
        logger.error("Error in createMailJobService", "job.service", error);
        throw error;
    }
}
export async function createAiResponseJobService({ prompt, idempotency_key, priority, }) {
    try {
        const payload = {
            prompt,
        };
        const normalizedPriority = normalizeJobPriority(priority);
        const input = {
            type: "ai",
            queue_name: "aiQueue",
            payload,
            idempotency_key,
            priority: normalizedPriority,
        };
        const job = await jobRepo.create(input);
        return job;
    }
    catch (error) {
        logger.error("Error in createAiResponseJobService", "job.service", error);
        throw error;
    }
}
export async function createImageProcessingJobService({ uploadedImageKey, idempotency_key, priority, }) {
    try {
        const payload = {
            uploadedImageKey,
        };
        const normalizedPriority = normalizeJobPriority(priority);
        const input = {
            type: "image",
            queue_name: "imageQueue",
            payload,
            idempotency_key,
            priority: normalizedPriority,
        };
        const job = await jobRepo.create(input);
        return job;
    }
    catch (error) {
        logger.error("Error in createImageProcessingJobService", "job.service", error);
        throw error;
    }
}
export async function getJobService(id) {
    try {
        const job = await jobRepo.findById(id);
        if (!job) {
            throw new Error(`Job not found: ${id}`);
        }
        return job;
    }
    catch (error) {
        logger.error("Error in getJobService", "job.service", error);
        throw error;
    }
}
export async function getAllJobsService({ limit, page, }) {
    try {
        const skip = (page - 1) * limit;
        const { jobs, totalJobs } = await jobRepo.findAll(limit, skip);
        const totalPages = Math.ceil(totalJobs / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;
        return { jobs, totalJobs, hasNextPage, hasPreviousPage };
    }
    catch (error) {
        logger.error("Error in getAllJobsService", "job.service", error);
        throw error;
    }
}
export async function deleteJobService({ isImage, jobId, payload, queueName, }) {
    try {
        if (isImage) {
            const imagePayload = ImageJobPayloadSchema.parse(payload);
            const deletePromises = [
                deleteImageJobUploadedAndProcessedImageService({
                    uploadedImageKey: imagePayload.uploadedImageKey,
                    processedImageKey: imagePayload.processedImageKey ?? "",
                }),
                removeJobFromQueueService({ jobId, queueName }),
                jobRepo.deleteJob(jobId),
            ];
            await Promise.all(deletePromises);
        }
        else {
            const deletePromises = [
                removeJobFromQueueService({ jobId, queueName }),
                jobRepo.deleteJob(jobId),
            ];
            await Promise.all(deletePromises);
        }
    }
    catch (error) {
        logger.error("Error in deleteJobService", "job.service", error);
        throw error;
    }
}
export async function getAllQueueJobsService(queue) {
    try {
        const jobs = await jobRepo.findByQueueName(queue);
        return jobs;
    }
    catch (error) {
        logger.error("Error in getAllQueueJobsService", "job.service", error);
        throw error;
    }
}
export async function getAllStatusJobsService(status) {
    try {
        const jobs = await jobRepo.findByStatus(status);
        return jobs;
    }
    catch (error) {
        logger.error("Error in getAllStatusJobsService", "job.service", error);
        throw error;
    }
}
export async function getAllQueueStatusJobsService(queue, status) {
    try {
        const jobs = await jobRepo.findByQueueNameAndStatus(queue, status);
        return jobs;
    }
    catch (error) {
        logger.error("Error in getAllQueueStatusJobsService", "job.service", error);
        throw error;
    }
}
export async function retryJobService({ jobId, queueName, }) {
    try {
        const job = await jobRepo.findById(jobId);
        if (!job) {
            throw new Error(`Job not found: ${jobId}`);
        }
        if (job.status !== "failed" && job.status !== "pending") {
            throw new Error(`Job ${jobId} is not eligible for retry.`);
        }
        if (job.queue_name !== queueName) {
            throw new Error(`Job ${jobId} belongs to queue ${job.queue_name} and cannot be retried via ${queueName}.`);
        }
        const queue = QUEUES[queueName];
        if (!queue) {
            throw new Error(`Unknown queue: ${queueName}`);
        }
        const existingQueueJob = await queue.getJob(jobId);
        if (existingQueueJob) {
            await existingQueueJob.remove();
        }
        const retryPriority = normalizeJobPriority(job.priority ?? DEFAULT_JOB_PRIORITY);
        await jobRepo.setStatusPending(jobId);
        await jobRepo.updateJobPriority(jobId, retryPriority);
        if (job.type === "image") {
            const payload = ImageJobPayloadSchema.parse(job.payload);
            await addJobInImageQueueService({
                jobId: job.id,
                uploadedImageKey: payload.uploadedImageKey,
                ...(job.batchId ? { batchId: job.batchId } : {}),
                isLastStep: false,
                priority: retryPriority,
            });
        }
        else {
            await addJobInAiQueueService({
                payload: job.payload,
                isMail: job.type === "mail",
                jobId: job.id,
                ...(job.batchId ? { batchId: job.batchId } : {}),
                isLastStep: false,
                priority: retryPriority,
            });
        }
        return { ...job, priority: retryPriority };
    }
    catch (error) {
        logger.error("Error in retryJobService", "job.service", error);
        throw error;
    }
}
export async function removeJobFromQueueService({ jobId, queueName, }) {
    try {
        const queue = QUEUES[queueName];
        if (!queue) {
            throw new Error(`Unknown queue: ${queueName}`);
        }
        const job = await queue.getJob(jobId);
        if (!job) {
            return;
        }
        await job.remove();
    }
    catch (error) {
        logger.error("Error in removeJobFromQueueService", "job.service", error);
        throw error;
    }
}
export async function getImageJobUploadedAndProcessedImageUrlService({ processedImageKey, uploadedImageKey, }) {
    try {
        const [uploadedImageUrl, processedImageUrl] = await Promise.all([
            getImageUrlFromStorageService(uploadedImageKey),
            processedImageKey
                ? getImageUrlFromStorageService(processedImageKey)
                : Promise.resolve(null),
        ]);
        return { uploadedImageUrl, processedImageUrl };
    }
    catch (error) {
        logger.error("Error in getImageJobUploadedAndProcessedImageUrlService", "job.service", error);
        throw error;
    }
}
export async function deleteImageJobUploadedAndProcessedImageService({ processedImageKey, uploadedImageKey, }) {
    try {
        const deleteImagePromises = [
            deleteFromStorageService(uploadedImageKey),
            processedImageKey
                ? deleteFromStorageService(processedImageKey)
                : Promise.resolve(),
            ,
        ];
        await Promise.all(deleteImagePromises);
    }
    catch (error) {
        logger.error("Error in deleteImageJobUploadedAndProcessedImageService", "job.service", error);
        throw error;
    }
}
//# sourceMappingURL=job.service.js.map