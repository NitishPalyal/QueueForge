import type { Request, Response } from "express";
import type { APIResponse } from "../shared/types.ts";
import type { Status } from "../../generated/prisma/enums.ts";
import { type CreateAiResponseJobControllerBody, type CreateEmailJobControllerBody, type getAllJobsControllerQuerys } from "./job.types.ts";
export declare function createEmailJobController(req: Request<{}, {}, CreateEmailJobControllerBody>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>> | undefined>;
export declare function createAiResponseJobController(req: Request<{}, {}, CreateAiResponseJobControllerBody>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>> | undefined>;
export declare function createImageProcessingJobController(req: Request<{}, {}, {}, {}>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>> | undefined>;
export declare function getAllJobsController(req: Request<{}, {}, {}, getAllJobsControllerQuerys>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>> | undefined>;
export declare function retryJobByQueueAndIdController(req: Request<{
    queue: string;
    id: string;
}, {}, {}, {}>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>>>;
export declare function getJobByIdController(req: Request<{
    id: string;
}, {}, {}, {}>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>>>;
export declare function deleteJobByQueueAndIdController(req: Request<{
    queue: string;
    id: string;
}, {}, {}, {}>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>>>;
export declare function getJobStatusByIdController(req: Request<{
    id: string;
}, {}, {}, {}>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>> | undefined>;
export declare function getAllJobsByStatusController(req: Request<{
    status: Status;
}, {}, {}, {}>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>> | undefined>;
export declare function getAllJobsByQueueController(req: Request<{
    queue: string;
}, {}, {}, {}>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>> | undefined>;
export declare function getAllJobsByQueueAndStatusController(req: Request<{
    queue: string;
    status: Status;
}, {}, {}, {}>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>> | undefined>;
//# sourceMappingURL=job.controller.d.ts.map