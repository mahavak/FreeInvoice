import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

/**
 * Truly Build-Safe Prisma Client
 * Author: Senior AI Engineering Collaborator
 * Purpose: Allows Next.js to build without a DATABASE_URL by providing a No-Op proxy.
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createInstance = (): PrismaClient => {
  const connectionString = process.env.DATABASE_URL;

  // If we are in build mode or missing URL, return a Proxy that doesn't crash on property access
  if (!connectionString) {
    console.warn("[PRISMA_WARN]: DATABASE_URL is missing. Providing a No-Op Proxy for build compatibility.");
    return new Proxy({} as PrismaClient, {
      get: (target, prop) => {
        // Return a function that throws only when CALLED, not when accessed.
        // This allows PrismaAdapter to initialize without crashing the build.
        if (prop === 'then') return undefined;
        return () => {
          throw new Error("DATABASE_URL is not set. Please configure it in your environment variables.");
        };
      }
    });
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool as any);

  return new PrismaClient({
    adapter: adapter as any,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

export const prisma = globalForPrisma.prisma || createInstance();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
