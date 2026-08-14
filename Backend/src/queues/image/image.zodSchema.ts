import * as z from "zod";

/**
 * Validates the jobData for image-processing jobs.
 *
 * Fields:
 * - uploadedImageKey: image uploaded to storage for processing
 */
export const ImageJobDataSchema = z.object({
  uploadedImageKey: z.string(),
});

/**
 * Validates the complete payload for image-processing jobs.
 *
 * Follows the canonical queue structure with jobData + metadata.
 *
 * Fields:
 * - jobData: { uploadedImageKey }
 * - dbJobId: persisted database job identifier
 * - batchId: batch identifier when the job is part of a flow
 * - isLastStep: marks the last step in a sequence of queued actions
 */
export const ImageWorkerProcessingServiceDataSchema = z.object({
  jobData: ImageJobDataSchema,
  dbJobId: z.string().optional(),
  batchId: z.string().optional(),
  isLastStep: z.boolean(),
});
