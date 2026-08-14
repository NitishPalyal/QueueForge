import * as z from "zod";

/**
 * Base schema for all queue payloads.
 *
 * Every job queued across AI, Mail, and Image queues follows this structure.
 * Job-specific data is nested under 'jobData'; common metadata is at the root.
 *
 * Fields:
 * - jobData: queue-specific job information (shape varies by job type)
 * - dbJobId: database job identifier for the persisted record
 * - batchId: batch identifier when the job belongs to a multi-step flow
 * - isLastStep: marks the last step in a sequence of queued actions
 */
export const BaseQueuePayloadSchema = z.object({
  jobData: z.record(z.string(), z.any()),
  dbJobId: z.string().optional(),
  batchId: z.string().optional(),
  isLastStep: z.boolean().default(false),
});

/**
 * Shared worker metadata schema used by job lifecycle listeners.
 *
 * Fields:
 * - dbJobId: database job identifier for the persisted record
 * - batchId: batch identifier when the job belongs to a multi-step flow
 * - isLastStep: marks the last step in a sequence of queued actions
 */
export const WorkerSchema = z.object({
  dbJobId: z.string().optional(),
  batchId: z.string().optional(),
  isLastStep: z.boolean(),
});

/**
 * Response format expected from an AI-generated mail template.
 *
 * Fields:
 * - subject: generated email title
 * - html: final HTML mail content ready to send
 */
export const MailSchema = z.object({
  subject: z.string(),
  html: z.string(),
});

/**
 * Payload used by image-processing jobs after upload or transformation.
 *
 * Fields:
 * - uploadedImageKey: original uploaded file key in storage
 * - processedImageKey: transformed output key when available
 */
export const ImageJobPayloadSchema = z.object({
  uploadedImageKey: z.string(),
  processedImageKey: z.string().optional(),
});
