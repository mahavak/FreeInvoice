import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client with PostgreSQL Adapter
 * Author: Senior AI Engineering Collaborator
 * Purpose: Secure and stable database connection for Next.js 14.
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const connectionString = process.env.DATABASE_URL || 'postgresql://mock:mock@localhost:5432/mock'

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool as any)

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: adapter as any,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
