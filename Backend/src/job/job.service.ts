import type { Job, Status } from "../../generated/prisma/client.ts";
import {
  deleteFromStorageService,
  getImageUrlFromStorageService,
} from "../queues/image/image.service.ts";
import { ImageJobPayloadSchema } from "../shared/zod.schema.ts";
import * as jobRepo from "./job.repository.ts";
import { logger } from "../shared/logger.ts";
import {
  type CreateAiResponseJobRepositoryInput,
  type CreateAiResponseJobServiceParams,
  type CreateAiResponseJobPayload,
  type CreateImageProcessingJobServiceParams,
  type CreateMailJobRepositoryInput,
  type CreateMailJobServiceParams,
  type CreateMailJobPayload,
  type CreateImageProcessingJobPayload,
  type CreateImageProcessingJobRepositoryInput,
  DEFAULT_JOB_PRIORITY,
  normalizeJobPriority,
  QUEUES,
  type RemoveJobServiceParams,
  type GetImageJobUploadedAndProcessedImageUrlServiceParams,
  type DeleteImageJobUploadedAndProcessedImageServiceParams,
  type DeleteJobServiceParams,
  type getAllJobsServiceParams,
  type RetryJobServiceParams,
} from "./job.types.ts";
import { addJobInAiQueueService } from "../queues/ai/ai.service.ts";
import { addJobInImageQueueService } from "../queues/image/image.service.ts";

export async function createMailJobService({
  to,
  prompt,
  idempotency_key,
  priority,
}: CreateMailJobServiceParams): Promise<Job> {
  try {
    const payload: CreateMailJobPayload = {
      to,
      prompt,
    };

    const normalizedPriority = normalizeJobPriority(priority);

    const input: CreateMailJobRepositoryInput = {
      type: "mail",
      queue_name: "mailQueue",
      payload,
      idempotency_key,
      priority: normalizedPriority,
    };

    const job = await jobRepo.create(input);
    return job;
  } catch (error) {
    logger.error("Error in createMailJobService", "job.service", error);
    throw error;
  }
}

export async function createAiResponseJobService({
  prompt,
  idempotency_key,
  priority,
}: CreateAiResponseJobServiceParams): Promise<Job> {
  try {
    const payload: CreateAiResponseJobPayload = {
      prompt,
    };

    const normalizedPriority = normalizeJobPriority(priority);

    const input: CreateAiResponseJobRepositoryInput = {
      type: "ai",
      queue_name: "aiQueue",
      payload,
      idempotency_key,
      priority: normalizedPriority,
    };

    const job = await jobRepo.create(input);
    return job;
  } catch (error) {
    logger.error("Error in createAiResponseJobService", "job.service", error);
    throw error;
  }
}

export async function createImageProcessingJobService({
  uploadedImageKey,
  idempotency_key,
  priority,
}: CreateImageProcessingJobServiceParams): Promise<Job> {
  try {
    const payload: CreateImageProcessingJobPayload = {
      uploadedImageKey,
    };

    const normalizedPriority = normalizeJobPriority(priority);

    const input: CreateImageProcessingJobRepositoryInput = {
      type: "image",
      queue_name: "imageQueue",
      payload,
      idempotency_key,
      priority: normalizedPriority,
    };

    const job = await jobRepo.create(input);

    return job;
  } catch (error) {
    logger.error(
      "Error in createImageProcessingJobService",
      "job.service",
      error,
    );
    throw error;
  }
}

export async function getJobService(id: string): Promise<Job> {
  try {
    const job = await jobRepo.findById(id);
    if (!job) {
      throw new Error(`Job not found: ${id}`);
    }
    return job;
  } catch (error) {
    logger.error("Error in getJobService", "job.service", error);
    throw error;
  }
}

export async function getAllJobsService({
  limit,
  page,
}: getAllJobsServiceParams) {
  try {
    const skip = (page - 1) * limit;
    const { jobs, totalJobs } = await jobRepo.findAll(limit, skip);
    const totalPages = Math.ceil(totalJobs / limit);

    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    return { jobs, totalJobs, hasNextPage, hasPreviousPage };
  } catch (error) {
    logger.error("Error in getAllJobsService", "job.service", error);
    throw error;
  }
}

export async function deleteJobService({
  isImage,
  jobId,
  payload,
  queueName,
}: DeleteJobServiceParams) {
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
    } else {
      const deletePromises = [
        removeJobFromQueueService({ jobId, queueName }),
        jobRepo.deleteJob(jobId),
      ];

      await Promise.all(deletePromises);
    }
  } catch (error) {
    logger.error("Error in deleteJobService", "job.service", error);
    throw error;
  }
}

export async function getAllQueueJobsService(queue: string) {
  try {
    const jobs = await jobRepo.findByQueueName(queue);
    return jobs;
  } catch (error) {
    logger.error("Error in getAllQueueJobsService", "job.service", error);
    throw error;
  }
}

export async function getAllStatusJobsService(status: Status) {
  try {
    const jobs = await jobRepo.findByStatus(status);
    return jobs;
  } catch (error) {
    logger.error("Error in getAllStatusJobsService", "job.service", error);
    throw error;
  }
}

export async function getAllQueueStatusJobsService(
  queue: string,
  status: Status,
) {
  try {
    const jobs = await jobRepo.findByQueueNameAndStatus(queue, status);
    return jobs;
  } catch (error) {
    logger.error("Error in getAllQueueStatusJobsService", "job.service", error);
    throw error;
  }
}

export async function retryJobService({
  jobId,
  queueName,
}: RetryJobServiceParams): Promise<Job> {
  try {
    const job = await jobRepo.findById(jobId);

    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    if (job.status !== "failed" && job.status !== "pending") {
      throw new Error(`Job ${jobId} is not eligible for retry.`);
    }

    if (job.queue_name !== queueName) {
      throw new Error(
        `Job ${jobId} belongs to queue ${job.queue_name} and cannot be retried via ${queueName}.`,
      );
    }

    const queue = QUEUES[queueName];
    if (!queue) {
      throw new Error(`Unknown queue: ${queueName}`);
    }

    const existingQueueJob = await queue.getJob(jobId);
    if (existingQueueJob) {
      await existingQueueJob.remove();
    }

    const retryPriority = normalizeJobPriority(
      job.priority ?? DEFAULT_JOB_PRIORITY,
    );

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
    } else {
      await addJobInAiQueueService({
        payload: job.payload as Record<string, unknown>,
        isMail: job.type === "mail",
        jobId: job.id,
        ...(job.batchId ? { batchId: job.batchId } : {}),
        isLastStep: false,
        priority: retryPriority,
      });
    }

    return { ...job, priority: retryPriority };
  } catch (error) {
    logger.error("Error in retryJobService", "job.service", error);
    throw error;
  }
}

export async function removeJobFromQueueService({
  jobId,
  queueName,
}: RemoveJobServiceParams): Promise<void> {
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
  } catch (error) {
    logger.error("Error in removeJobFromQueueService", "job.service", error);
    throw error;
  }
}

export async function getImageJobUploadedAndProcessedImageUrlService({
  processedImageKey,
  uploadedImageKey,
}: GetImageJobUploadedAndProcessedImageUrlServiceParams): Promise<{
  uploadedImageUrl: string;
  processedImageUrl: string | null;
}> {
  try {
    const [uploadedImageUrl, processedImageUrl] = await Promise.all([
      getImageUrlFromStorageService(uploadedImageKey),
      processedImageKey
        ? getImageUrlFromStorageService(processedImageKey)
        : Promise.resolve(null),
    ]);

    return { uploadedImageUrl, processedImageUrl };
  } catch (error) {
    logger.error(
      "Error in getImageJobUploadedAndProcessedImageUrlService",
      "job.service",
      error,
    );
    throw error;
  }
}

export async function deleteImageJobUploadedAndProcessedImageService({
  processedImageKey,
  uploadedImageKey,
}: DeleteImageJobUploadedAndProcessedImageServiceParams) {
  try {
    const deleteImagePromises = [
      deleteFromStorageService(uploadedImageKey),
      processedImageKey
        ? deleteFromStorageService(processedImageKey)
        : Promise.resolve(),
      ,
    ];
    await Promise.all(deleteImagePromises);
  } catch (error) {
    logger.error(
      "Error in deleteImageJobUploadedAndProcessedImageService",
      "job.service",
      error,
    );
    throw error;
  }
}
