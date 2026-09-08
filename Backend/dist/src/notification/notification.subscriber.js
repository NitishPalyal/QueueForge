import Redis from "ioredis";
import { connection } from "../shared/connection.js";
export const subscriber = new Redis.default(connection);
//# sourceMappingURL=notification.subscriber.js.map