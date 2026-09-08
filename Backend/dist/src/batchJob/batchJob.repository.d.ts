import { Status } from "../../generated/prisma/client.ts";
import type { BatchCreateInput } from "../../generated/prisma/models.ts";
export declare function findAll(limit: number, skip: number): Promise<{
    batches: {
        id: string;
        createdAt: Date;
        type: string;
        payload: import("@prisma/client/runtime/client").JsonValue;
        status: Status;
        completedAt: Date | null;
        totalSteps: number;
    }[];
    totalBatches: number;
}>;
export declare function findById(id: string): Promise<{
    id: string;
    createdAt: Date;
    type: string;
    payload: import("@prisma/client/runtime/client").JsonValue;
    status: Status;
    completedAt: Date | null;
    totalSteps: number;
} | null>;
export declare function create(data: BatchCreateInput): Promise<{
    id: string;
    createdAt: Date;
    type: string;
    payload: import("@prisma/client/runtime/client").JsonValue;
    status: Status;
    completedAt: Date | null;
    totalSteps: number;
}>;
export declare function deleteBatch(id: string): Promise<void>;
export declare function setStatusActive(id: string): Promise<void>;
export declare function setStatusCompleted(id: string): Promise<void>;
export declare function setStatusFailed(id: string): Promise<void>;
//# sourceMappingURL=batchJob.repository.d.ts.map