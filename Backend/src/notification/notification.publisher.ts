import Redis from "ioredis";
import { connection } from "../shared/connection.ts";

export const publisher = new Redis.default(connection);
