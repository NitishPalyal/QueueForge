import Redis from "ioredis";
import { connection } from "../shared/connection.js";
export const publisher = new Redis.default(connection);
//# sourceMappingURL=notification.publisher.js.map