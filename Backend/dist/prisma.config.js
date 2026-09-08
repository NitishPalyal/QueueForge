import "dotenv/config";
import { defineConfig } from "prisma/config";
import configKeys from "./src/config/config.keys.js";
export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: configKeys.DATABASE_URL,
    },
});
//# sourceMappingURL=prisma.config.js.map