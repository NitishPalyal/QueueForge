import { Queue } from "bullmq";
import { connection } from "../../shared/connection.js";
const aiQueue = new Queue("ai", { connection });
export { connection, aiQueue };
//# sourceMappingURL=ai.queue.js.map