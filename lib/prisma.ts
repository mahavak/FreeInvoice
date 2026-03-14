import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

/**
 * Build-Safe Prisma Client (Truly Lazy)
 * Author: Senior AI Engineering Collaborator
 * Purpose: Prevent crashes during 'next build' by deferring instantiation until first query.
 */

let prismaInstance: PrismaClient | null = null;

const getPrisma = (): PrismaClient => {
  if (prismaInstance) return prismaInstance;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    // During build, we return a shell that doesn't throw until a method is called.
    // This allows Next.js to complete the build without a DATABASE_URL.
    return new Proxy({} as PrismaClient, {
      get: (target, prop) => {
        throw new Error(
          `Prisma accessed before DATABASE_URL was set. Property: ${String(prop)}. ` +
          `Ensure DATABASE_URL is in your environment variables.`
        );
      }
    });
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool as any);

  prismaInstance = new PrismaClient({
    adapter: adapter as any,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  return prismaInstance;
};

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Export as a getter-compatible object or just the instance
export const prisma = globalForPrisma.prisma || getPrisma();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
