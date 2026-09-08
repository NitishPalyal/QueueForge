import type { Request, Response } from "express";
import type { APIResponse } from "../shared/types.ts";
import type { createBatchControllerBody, deleteImageControllerBody, getAllBatchesControllerQuerys } from "./batchJob.types.ts";
export declare function uploadImageController(req: Request<{}, {}, {}, {}>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>> | undefined>;
export declare function deleteImageController(req: Request<{}, {}, deleteImageControllerBody, {}>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>> | undefined>;
export declare function createBatchJobController(req: Request<{}, {}, createBatchControllerBody, {}>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>>>;
export declare function getAllBatchesController(req: Request<{}, {}, {}, getAllBatchesControllerQuerys>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>>>;
export declare function getBatchJobsByIdController(req: Request<{
    id: string;
}, {}, {}, {}>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>>>;
export declare function deleteBatchByIdController(req: Request<{
    id: string;
}, {}, {}, {}>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>>>;
//# sourceMappingURL=batchJob.controller.d.ts.map