import type { Step } from "./batchJob.zodSchema.ts";
export interface JobRow {
    id: string;
    type: string;
    status: string;
    batchId: string | null;
    stepOrder: number | null;
}
export interface BatchStepMeta {
    dbJobId: string;
    batchId: string;
    isLastStep: boolean;
}
export declare const QUEUE_BY_TYPE: Record<Step["type"], string>;
export interface buildFlowTreeServiceParam {
    steps: Step[];
    jobs: JobRow[];
    batchId: string;
}
export interface toFlowJobParam {
    step: Step;
    job: JobRow;
    isLastStep: boolean;
}
export interface createBatchParam {
    steps: Step[];
}
export interface setBatchStatusCompletedParam {
    dbJobId: string;
    batchId: string | undefined;
    isLastStep: boolean;
}
export interface setBatchStatusFailedParam {
    dbJobId: string;
    batchId: string | undefined;
    isLastStep: boolean;
    error: string;
}
export interface createBatchControllerBody {
    steps: Step[];
}
export interface getAllBatchesControllerQuerys {
    page?: string | undefined;
    limit?: string | undefined;
}
export interface getAllBatchesServiceParams {
    page: number;
    limit: number;
}
export interface deleteImageControllerBody {
    uploadedImageKey: string;
}
//# sourceMappingURL=batchJob.types.d.ts.map