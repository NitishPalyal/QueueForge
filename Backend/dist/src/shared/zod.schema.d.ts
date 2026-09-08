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
export declare const BaseQueuePayloadSchema: z.ZodObject<{
    jobData: z.ZodRecord<z.ZodString, z.ZodAny>;
    jobId: z.ZodString;
    batchId: z.ZodOptional<z.ZodString>;
    isLastStep: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
/**
 * Shared worker metadata schema used by job lifecycle listeners.
 *
 * Fields:
 * - dbJobId: database job identifier for the persisted record
 * - batchId: batch identifier when the job belongs to a multi-step flow
 * - isLastStep: marks the last step in a sequence of queued actions
 */
export declare const WorkerSchema: z.ZodObject<{
    jobId: z.ZodString;
    batchId: z.ZodOptional<z.ZodString>;
    isLastStep: z.ZodBoolean;
}, z.core.$strip>;
/**
 * Response format expected from an AI-generated mail template.
 *
 * Fields:
 * - subject: generated email title
 * - html: final HTML mail content ready to send
 */
export declare const MailSchema: z.ZodObject<{
    subject: z.ZodString;
    html: z.ZodString;
}, z.core.$strip>;
/**
 * Payload used by image-processing jobs after upload or transformation.
 *
 * Fields:
 * - uploadedImageKey: original uploaded file key in storage
 * - processedImageKey: transformed output key when available
 */
export declare const ImageJobPayloadSchema: z.ZodObject<{
    uploadedImageKey: z.ZodString;
    processedImageKey: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=zod.schema.d.ts.map