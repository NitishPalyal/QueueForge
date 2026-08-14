import { Queue } from "bullmq";
import { connection } from "../../shared/connection.ts";

const aiQueue = new Queue("ai", { connection });

export { connection, aiQueue };
