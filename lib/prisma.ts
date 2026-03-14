import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client with PostgreSQL Adapter (Lazy Loading)
 * Author: Senior AI Engineering Collaborator
 * Purpose: Prevent crashes during build/initialization if DB is not yet available.
 */

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn("[PRISMA_WARN]: DATABASE_URL is missing. Database features will be unavailable.");
    // Return a dummy object or handle based on your needs. 
    // Here we still return a client but it will fail on query rather than on module load.
    return new PrismaClient();
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool as any);

  return new PrismaClient({
    adapter: adapter as any,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
