import { FlowProducer } from "bullmq";
import { connection } from "../shared/connection.ts";

export const flowProducer = new FlowProducer({ connection });
