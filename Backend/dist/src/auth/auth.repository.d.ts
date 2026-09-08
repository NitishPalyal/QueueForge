import type { UserCreateInput } from "../../generated/prisma/models.ts";
export declare function findById(id: string): Promise<{
    id: string;
    email: string;
    fullname: string;
    password: string;
    createdAt: Date;
} | null>;
export declare function findByEmail(email: string): Promise<{
    id: string;
    email: string;
    fullname: string;
    password: string;
    createdAt: Date;
} | null>;
export declare function findByEmailAndFullname(email: string, fullname: string): Promise<{
    id: string;
    email: string;
    fullname: string;
    password: string;
    createdAt: Date;
} | null>;
export declare function createUser(data: UserCreateInput): Promise<{
    id: string;
    email: string;
    fullname: string;
    password: string;
    createdAt: Date;
}>;
export declare function deleteUser(id: string): Promise<void>;
//# sourceMappingURL=auth.repository.d.ts.map