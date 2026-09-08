import { z } from "zod";
declare const StepSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"image">;
    data: z.ZodObject<{
        uploadedImageKey: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"mail">;
    data: z.ZodObject<{
        to: z.ZodString;
        prompt: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"ai">;
    data: z.ZodObject<{
        prompt: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>], "type">;
export declare const BatchRequestSchema: z.ZodObject<{
    steps: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"image">;
        data: z.ZodObject<{
            uploadedImageKey: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"mail">;
        data: z.ZodObject<{
            to: z.ZodString;
            prompt: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"ai">;
        data: z.ZodObject<{
            prompt: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>], "type">>;
}, z.core.$strip>;
export type Step = z.infer<typeof StepSchema>;
export type BatchRequest = z.infer<typeof BatchRequestSchema>;
export {};
//# sourceMappingURL=batchJob.zodSchema.d.ts.map