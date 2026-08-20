import { Redis } from "ioredis";
import { connection } from "../shared/connection.ts";

export const redis = new Redis(connection);
