import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client for FreeInvoice
 * PostgreSQL (Neon) for production, SQLite for local dev
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}