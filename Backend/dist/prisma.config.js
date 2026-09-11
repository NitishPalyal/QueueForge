import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import configKeys from "./src/config/config.keys.js";
export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: env("DATABASE_URL"),
    },
});
//# sourceMappingURL=prisma.config.js.map