import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/config.redis.js";
export const dbOperationRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => redis.call(args[0], ...args.slice(1)),
    }),
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});
export const jobCreationRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 500,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => redis.call(args[0], ...args.slice(1)),
    }),
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});
//# sourceMappingURL=job.rateLimiters.js.map