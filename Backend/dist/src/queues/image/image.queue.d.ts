import { Queue } from "bullmq";
import { connection } from "../../shared/connection.ts";
declare const imageQueue: Queue<any, any, string, any, any, string>;
export { connection, imageQueue };
//# sourceMappingURL=image.queue.d.ts.map