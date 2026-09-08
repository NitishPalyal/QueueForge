import type { NextFunction, Request, Response } from "express";
export declare function validate(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare const uploadImageValidator: (import("express-validator").ValidationChain | typeof validate)[];
export declare const deleteImageValidator: (import("express-validator").ValidationChain | typeof validate)[];
export declare const createBatchJobValidator: (import("express-validator").ValidationChain | typeof validate)[];
export declare const deleteBatchByIdValidator: (import("express-validator").ValidationChain | typeof validate)[];
export declare const getBatchJobsByIdValidator: (import("express-validator").ValidationChain | typeof validate)[];
//# sourceMappingURL=batchJob.validator.d.ts.map