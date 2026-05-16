import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { getTierLimits, canCreateInvoice } from '@/lib/stripe'

/**
 * GET /api/stripe/subscription
 * Returns current subscription status and usage
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionType: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripeCurrentPeriodEnd: true,
        invoicesThisMonth: true,
        lastInvoiceReset: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const tierLimits = getTierLimits(user.subscriptionType)
    const invoiceStatus = canCreateInvoice(
      user.invoicesThisMonth,
      user.subscriptionType
    )

    return NextResponse.json({
      subscription: {
        tier: user.subscriptionType,
        tierName: tierLimits.tierName,
        maxInvoices: tierLimits.maxInvoices,
        invoicesUsed: user.invoicesThisMonth,
        invoicesRemaining: invoiceStatus.remaining,
        canCreateInvoice: invoiceStatus.allowed,
        currentPeriodEnd: user.stripeCurrentPeriodEnd,
      },
      user: {
        name: user.name,
        email: user.email,
      }
    })
  } catch (error: any) {
    console.error('[SUBSCRIPTION_ERROR]:', error.message)
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}