import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { canCreateInvoice, getTierLimits } from '@/lib/stripe'

/**
 * Usage Tracking Middleware
 * Checks and increments invoice usage for the current billing period
 */

interface UsageCheckResult {
  allowed: boolean
  remaining: number
  tierName: string
  userId: string
}

/**
 * Check if user can create an invoice and get their tier info
 * Call this BEFORE generating an invoice
 */
export async function checkInvoiceUsage(): Promise<UsageCheckResult | NextResponse> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Check if we need to reset the monthly counter
  const now = new Date()
  const lastReset = user.lastInvoiceReset || new Date(0)
  const monthsSinceReset = 
    (now.getFullYear() - lastReset.getFullYear()) * 12 +
    (now.getMonth() - lastReset.getMonth())

  if (monthsSinceReset >= 1) {
    // Reset counter for new month
    await prisma.user.update({
      where: { id: user.id },
      data: {
        invoicesThisMonth: 0,
        lastInvoiceReset: now,
      }
    })
    user.invoicesThisMonth = 0
  }

  const { allowed, remaining } = canCreateInvoice(
    user.invoicesThisMonth,
    user.subscriptionType
  )

  const { tierName } = getTierLimits(user.subscriptionType)

  return {
    allowed,
    remaining,
    tierName,
    userId: user.id,
  }
}

/**
 * Increment the invoice counter after successful generation
 * Call this AFTER successfully generating an invoice
 */
export async function incrementInvoiceUsage(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      invoicesThisMonth: { increment: 1 }
    }
  })
}

/**
 * Decrement the invoice counter (for rollbacks)
 */
export async function decrementInvoiceUsage(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      invoicesThisMonth: { decrement: 1 }
    }
  })
}