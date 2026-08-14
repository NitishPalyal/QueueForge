// batch.schema.ts
import { z } from "zod";

const ImageStepSchema = z.object({
  type: z.literal("image"),
  data: z.object({
    uploadedImageKey: z.string().min(1, "storageKey is required"),
  }),
});

const MailStepSchema = z.object({
  type: z.literal("mail"),
  data: z.object({
    to: z.string().email("must be a valid email address"),
    prompt: z.string().min(1, "prompt is required"),
  }),
});

const AiStepSchema = z.object({
  type: z.literal("ai"),
  data: z.object({
    prompt: z.string().min(1, "prompt is required"),
  }),
});

// a step must be EXACTLY one of these three shapes
const StepSchema = z.discriminatedUnion("type", [
  ImageStepSchema,
  MailStepSchema,
  AiStepSchema,
]);

export const BatchRequestSchema = z.object({
  steps: z
    .array(StepSchema)
    .min(2, "a batch needs at least 2 steps")
    .max(3, "a batch can have at most 3 steps")
    .refine(
      (steps) => new Set(steps.map((s) => s.type)).size === steps.length,
      { message: "each job type can only appear once in a batch" },
    ),
});

// types generated FROM the schema — one definition, not two that can drift apart
export type Step = z.infer<typeof StepSchema>;
export type BatchRequest = z.infer<typeof BatchRequestSchema>;
