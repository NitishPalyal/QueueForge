import type { Request, Response } from "express";
import type { APIResponse } from "../shared/types.ts";
export declare function getJobBenchmarkController(req: Request<{
    jobType: string;
}, {}, {}, {}>, res: Response<APIResponse>): Promise<Response>;
export declare function getBatchJobBenchmarkController(req: Request, res: Response): Promise<Response>;
//# sourceMappingURL=benchmark.controller.d.ts.map