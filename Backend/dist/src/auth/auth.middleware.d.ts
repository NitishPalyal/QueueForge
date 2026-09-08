import type { NextFunction, Request, Response } from "express";
/**
 * Validates the authenticated session for protected routes.
 *
 * This guard is shared across all user-protected endpoints and is intended to
 * behave as the standard userAuthValidator for the application.
 */
export declare const authenticateUserMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Shared auth guard used across protected routes.
 *
 * This alias keeps the auth middleware name consistent with the rest of the
 * validation naming pattern used in the project.
 */
export declare const userAuthValidator: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.middleware.d.ts.map