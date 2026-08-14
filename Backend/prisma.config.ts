import "dotenv/config";
import { defineConfig } from "prisma/config";
import configKeys from "./src/config/config.ts";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: configKeys.DATABASE_URL,
  },
});
