// This file configures the Prisma CLI (db push, migrate, etc.)
// NOTE: In Prisma v7, directUrl was removed. The `url` here is used by
// the CLI only — set it to the DIRECT connection (not PgBouncer pooler).
// PrismaClient at runtime uses the pg adapter (see lib/prisma.ts).
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Direct URL — required for Prisma CLI db push/migrate (bypasses PgBouncer)
    url: process.env["DIRECT_URL"],
  },
});
