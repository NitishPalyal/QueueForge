import { type User } from "../../generated/prisma/client.ts";
import type { ComparePasswordServiceParam, createUserServiceParams, findUserByEmailAndFullnameServiceParam } from "./auth.types.ts";
import type { APIResponse } from "../shared/types.ts";
import type { Response } from "express";
export declare function sendTokenResponse(user: User, res: Response<APIResponse>, message: string): Promise<Response<APIResponse, Record<string, any>> | undefined>;
export declare function hashPasswordService(password: string): Promise<string>;
export declare function comparePasswordService({ password, hashedPassword, }: ComparePasswordServiceParam): Promise<boolean>;
export declare function findUserByEmailAndFullnameService({ email, fullname, }: findUserByEmailAndFullnameServiceParam): Promise<boolean>;
export declare function createUserService({ fullname, email, password, }: createUserServiceParams): Promise<User>;
export declare function getUserByEmail(email: string): Promise<User | null>;
export declare function deleteUserById(id: string): Promise<void>;
//# sourceMappingURL=auth.service.d.ts.map