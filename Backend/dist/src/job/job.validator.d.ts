import type { NextFunction, Request, Response } from "express";
export declare function validate(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare const createEmailJobValidator: (import("express-validator").ValidationChain | typeof validate)[];
export declare const createAiResponseJobValidator: (import("express-validator").ValidationChain | typeof validate)[];
export declare const createImageProcessingJobValidator: (import("express-validator").ValidationChain | typeof validate)[];
export declare const getJobByIdValidator: (import("express-validator").ValidationChain | typeof validate)[];
export declare const deleteJobByQueueAndIdValidator: (import("express-validator").ValidationChain | typeof validate)[];
export declare const retryJobByQueueAndIdValidator: (import("express-validator").ValidationChain | typeof validate)[];
export declare const getJobStatusByIdValidator: (import("express-validator").ValidationChain | typeof validate)[];
export declare const getAllJobsByStatusValidator: (import("express-validator").ValidationChain | typeof validate)[];
export declare const getAllJobsByQueueValidator: (import("express-validator").ValidationChain | typeof validate)[];
export declare const getAllJobsByQueueAndStatusValidator: (import("express-validator").ValidationChain | typeof validate)[];
//# sourceMappingURL=job.validator.d.ts.map