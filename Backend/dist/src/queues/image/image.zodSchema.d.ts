import * as z from "zod";
/**
 * Validates the jobData for image-processing jobs.
 *
 * Fields:
 * - uploadedImageKey: image uploaded to storage for processing
 */
export declare const ImageJobDataSchema: z.ZodObject<{
    uploadedImageKey: z.ZodString;
}, z.core.$strip>;
/**
 * Validates the complete payload for image-processing jobs.
 *
 * Follows the canonical queue structure with jobData + metadata.
 *
 * Fields:
 * - jobData: { uploadedImageKey }
 * - jobId: persisted database job identifier
 * - batchId: batch identifier when the job is part of a flow
 * - isLastStep: marks the last step in a sequence of queued actions
 */
export declare const ImageWorkerProcessingServiceDataSchema: z.ZodObject<{
    jobData: z.ZodObject<{
        uploadedImageKey: z.ZodString;
    }, z.core.$strip>;
    jobId: z.ZodString;
    batchId: z.ZodOptional<z.ZodString>;
    isLastStep: z.ZodBoolean;
}, z.core.$strip>;
//# sourceMappingURL=image.zodSchema.d.ts.map