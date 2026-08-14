import configKeys from "../config/config.ts";

export const connection = {
  host: configKeys.REDIS_HOST,
  port: Number(configKeys.REDIS_PORT || "6379"),
};
