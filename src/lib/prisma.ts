import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 requires an explicit driver adapter, a bare `new PrismaClient()`
// throws. The adapter wraps a standard `pg` connection pool; Prisma queries
// through it instead of its old built-in connection engine.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Standard Next.js singleton pattern: without this, every hot-reload in
// dev creates a new PrismaClient and eventually exhausts the DB's
// connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
