import type { User } from "../../generated/prisma/client.ts";
declare global {
    namespace Express {
        interface Request {
            user: User;
        }
    }
}
export {};
//# sourceMappingURL=express.types.d.ts.map