import * as z from "zod";
/**
 * Validates the jobData for email-generation jobs in AI queue.
 *
 * Fields:
 * - prompt: instruction text used to generate the email content
 * - to: target recipient email address
 */
export declare const AiEmailJobDataSchema: z.ZodObject<{
    prompt: z.ZodString;
    to: z.ZodString;
}, z.core.$strip>;
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
export declare const AiWorkerEmailServiceDataSchema: z.ZodObject<{
    jobData: z.ZodObject<{
        prompt: z.ZodString;
        to: z.ZodString;
    }, z.core.$strip>;
    jobId: z.ZodString;
    batchId: z.ZodOptional<z.ZodString>;
    isLastStep: z.ZodBoolean;
}, z.core.$strip>;
/**
 * Validates the jobData for standard AI response jobs.
 *
 * Fields:
 * - prompt: raw user request sent to the selected AI provider
 */
export declare const AiResponseJobDataSchema: z.ZodObject<{
    prompt: z.ZodString;
}, z.core.$strip>;
/**
 * Validates the complete payload for standard AI response jobs.
 *
 * Follows the canonical queue structure with jobData + metadata.
 *
 * Fields:
 * - jobData: { prompt }
 * - dbJobId: persisted database job identifier
 */
export declare const AiWorkerAiResponseDataSchema: z.ZodObject<{
    jobData: z.ZodObject<{
        prompt: z.ZodString;
    }, z.core.$strip>;
    jobId: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=ai.zodSchema.d.ts.map