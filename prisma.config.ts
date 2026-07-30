// Prisma 7 moved runtime connection configuration out of schema.prisma and
// into this file. It's read by the Prisma CLI (migrate, generate, studio,
// seed) — the application itself connects via the driver adapter in
// src/lib/prisma.ts, which is separate and unaffected by this file.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
