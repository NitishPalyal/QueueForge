import type { NextFunction, Request, Response } from "express";
export declare function validate(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare const registerValidator: (import("express-validator").ValidationChain | typeof validate)[];
export declare const loginValidator: (import("express-validator").ValidationChain | typeof validate)[];
//# sourceMappingURL=auth.validator.d.ts.map