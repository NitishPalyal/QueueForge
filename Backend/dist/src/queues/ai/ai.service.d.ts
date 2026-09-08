import type { generateAiResponseForEmailParam, AiMailJobPayload, generateMailContentParam, AiQueuePayload, generateAiResponseParam } from "./ai.types.ts";
export declare function generateAiContentService(prompt: string): Promise<string>;
export declare function generateMailContentService({ to, prompt, }: generateMailContentParam): Promise<AiMailJobPayload>;
export declare function generateAiResponseService({ prompt, jobId, }: generateAiResponseParam): Promise<void>;
export declare function generateAiResponseForEmailService({ prompt, to, jobId, batchId, isLastStep, }: generateAiResponseForEmailParam): Promise<void>;
export declare function addJobInAiQueueService({ payload, isMail, batchId, isLastStep, jobId, priority, }: AiQueuePayload): Promise<void>;
//# sourceMappingURL=ai.service.d.ts.map