import { Queue } from "bullmq";
import { connection } from "../../shared/connection.ts";

const imageQueue = new Queue("image", { connection });

export { connection, imageQueue };
