import configKeys from "../config/config.keys.js";
export const connection = {
    host: configKeys.REDIS_HOST,
    port: Number(configKeys.REDIS_PORT || "6379"),
};
//# sourceMappingURL=connection.js.map