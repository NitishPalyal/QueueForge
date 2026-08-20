import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/config.redis.ts";

export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  store: new RedisStore({
    sendCommand: (...args: string[]) =>
      redis.call(args[0]!, ...args.slice(1)) as Promise<number>,
  }),

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
export const expensiveRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  store: new RedisStore({
    sendCommand: (...args: string[]) =>
      redis.call(args[0]!, ...args.slice(1)) as Promise<number>,
  }),

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
