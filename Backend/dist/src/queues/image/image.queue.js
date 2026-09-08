import { Queue } from "bullmq";
import { connection } from "../../shared/connection.js";
const imageQueue = new Queue("image", { connection });
export { connection, imageQueue };
//# sourceMappingURL=image.queue.js.map