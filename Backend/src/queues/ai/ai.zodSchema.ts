import * as z from "zod";

/**
 * Validates the jobData for email-generation jobs in AI queue.
 *
 * Fields:
 * - prompt: instruction text used to generate the email content
 * - to: target recipient email address
 */
export const AiEmailJobDataSchema = z.object({
  prompt: z.string(),
  to: z.string(),
});

/**
 * Validates the complete payload for email-generation jobs processed by the AI worker.
 *
 * Follows the canonical queue structure with jobData + metadata.
 *
 * Fields:
 * - jobData: { prompt, to }
 * - dbJobId: persisted database job identifier
 * - batchId: batch identifier when the job is part of a flow
 * - isLastStep: true when this is the final step in the flow
 */
export const AiWorkerEmailServiceDataSchema = z.object({
  jobData: AiEmailJobDataSchema,
  dbJobId: z.string().optional(),
  batchId: z.string().optional(),
  isLastStep: z.boolean(),
});

/**
 * Validates the jobData for standard AI response jobs.
 *
 * Fields:
 * - prompt: raw user request sent to the selected AI provider
 */
export const AiResponseJobDataSchema = z.object({
  prompt: z.string(),
});

/**
 * Validates the complete payload for standard AI response jobs.
 *
 * Follows the canonical queue structure with jobData + metadata.
 *
 * Fields:
 * - jobData: { prompt }
 * - dbJobId: persisted database job identifier
 */
export const AiWorkerAiResponseDataSchema = z.object({
  jobData: AiResponseJobDataSchema,
  dbJobId: z.string().optional(),
});
