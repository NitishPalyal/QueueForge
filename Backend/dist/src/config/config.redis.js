import { Redis } from "ioredis";
import { connection } from "../shared/connection.js";
export const redis = new Redis(connection);
//# sourceMappingURL=config.redis.js.map