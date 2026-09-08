import type { Request, Response } from "express";
import type { APIResponse } from "../shared/types.ts";
import type { LoginControllerBody, RegisterControllerBody } from "./auth.types.ts";
export declare function registerController(req: Request<{}, {}, RegisterControllerBody, {}>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>> | undefined>;
export declare function loginController(req: Request<{}, {}, LoginControllerBody, {}>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>> | undefined>;
export declare function getMeController(req: Request<{}, {}, {}, {}>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>> | undefined>;
export declare function logoutController(req: Request<{}, {}, {}, {}>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>>>;
export declare function deleteUserController(req: Request<{}, {}, {}, {}>, res: Response<APIResponse>): Promise<Response<APIResponse, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.controller.d.ts.map