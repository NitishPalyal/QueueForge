import type { Batch, Job } from "../../generated/prisma/client.ts";
import { type createBatchParam, type setBatchStatusCompletedParam, type getAllBatchesServiceParams, type setBatchStatusFailedParam } from "./batchJob.types.ts";
export declare function createBatchService({ steps, }: createBatchParam): Promise<Batch>;
export declare function setBatchStatusCompletedService({ dbJobId, batchId, isLastStep, }: setBatchStatusCompletedParam): Promise<void>;
export declare function setBatchStatusActiveService({ dbJobId, batchId, }: {
    dbJobId: string;
    batchId: string | undefined;
}): Promise<void>;
export declare function setBatchStatusFailedService({ dbJobId, batchId, isLastStep, error, }: setBatchStatusFailedParam): Promise<void>;
export declare function getBatchJobsService(batchId: string): Promise<Job[]>;
export declare function deleteBatchService(batchId: string): Promise<void>;
export declare function getBatchService(batchId: string): Promise<boolean>;
export declare function getAllBatchesService({ limit, page, }: getAllBatchesServiceParams): Promise<{
    batches: {
        id: string;
        createdAt: Date;
        type: string;
        payload: import("@prisma/client/runtime/client").JsonValue;
        status: import("../../generated/prisma/enums.ts").Status;
        completedAt: Date | null;
        totalSteps: number;
    }[];
    totalBatches: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}>;
//# sourceMappingURL=batchJob.service.d.ts.map