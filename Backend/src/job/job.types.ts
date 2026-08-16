import type { Prisma } from "../../generated/prisma/client.ts";
import { Queue } from "bullmq";
import { imageQueue } from "../queues/image/image.queue.ts";
import { aiQueue } from "../queues/ai/ai.queue.ts";
import { mailQueue } from "../queues/mail/mail.queue.ts";

/**
 * Registry of known queues used by the application.
 *
 * This central map allows service-layer logic to resolve a queue by name
 * without hardcoding the queue instances across the project.
 */
export const QUEUES: Record<string, Queue> = {
  imageQueue,
  aiQueue,
  mailQueue,
};

/**
 * Request body for creating an AI response job from the controller layer.
 */
export interface CreateAiResponseJobControllerBody {
  prompt: string;
  idempotency_key: string;
}

/**
 * Parameters accepted by createAiResponseJobService.
 */
export interface CreateAiResponseJobServiceParams {
  prompt: string;
  idempotency_key: string;
}

/**
 * JSON payload stored for AI response jobs.
 */
export interface CreateAiResponseJobPayload extends Prisma.InputJsonObject {
  prompt: string;
}

/**
 * Database input used when creating an AI response job record.
 */
export interface CreateAiResponseJobRepositoryInput {
  type: string;
  queue_name: string;
  payload: CreateAiResponseJobPayload;
  idempotency_key: string;
}

/**
 * Request body for creating an email-generation job from the controller layer.
 */
export interface CreateEmailJobControllerBody {
  to: string;
  prompt: string;
  idempotency_key: string;
}

/**
 * Parameters accepted by createMailJobService.
 */
export interface CreateMailJobServiceParams {
  to: string;
  prompt: string;
  idempotency_key: string;
}

/**
 * JSON payload stored for mail jobs.
 */
export interface CreateMailJobPayload extends Prisma.InputJsonObject {
  to: string;
  subject?: string;
  html?: any;
  prompt: string;
}

/**
 * Database input used when creating a mail job record.
 */
export interface CreateMailJobRepositoryInput {
  type: string;
  queue_name: string;
  payload: CreateMailJobPayload;
  idempotency_key: string;
}

/**
 * Request body for creating an image-processing job from the controller layer.
 */
export interface CreateImageProcessingJobControllerBody {
  idempotency_key: string;
}

/**
 * Parameters accepted by createImageProcessingJobService.
 */
export interface CreateImageProcessingJobServiceParams {
  uploadedImageKey: string;
  idempotency_key: string;
}

/**
 * JSON payload stored for image-processing jobs.
 */
export interface CreateImageProcessingJobPayload
  extends Prisma.InputJsonObject {
  uploadedImageKey: string;
}

/**
 * Database input used when creating an image-processing job record.
 */
export interface CreateImageProcessingJobRepositoryInput {
  type: string;
  queue_name: string;
  payload: CreateImageProcessingJobPayload;
  idempotency_key: string;
}

export enum JobType {
  "ai",
  "mail",
  "image",
}

/**
 * Parameters for resolving uploaded and processed image URLs.
 */
export interface GetImageJobUploadedAndProcessedImageUrlServiceParams {
  uploadedImageKey: string;
  processedImageKey: string;
}

/**
 * Parameters for deleting uploaded and processed image files from storage.
 */
export interface DeleteImageJobUploadedAndProcessedImageServiceParams {
  uploadedImageKey: string;
  processedImageKey: string;
}

/**
 * Parameters for removing a job from a queue.
 */
export interface RemoveJobServiceParams {
  jobId: string;
  queueName: string;
}

/**
 * Parameters for deleting a persisted job and its queue record.
 */
export interface DeleteJobServiceParams {
  payload?: unknown;
  jobId: string;
  isImage: boolean;
  queueName: string;
}
