import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/stripe/billing-portal
 * Creates a Stripe Customer Portal session for the authenticated user.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err: any) {
    console.error('[BILLING_PORTAL_ERROR]', err.message)
    return NextResponse.json({ error: 'Failed to create billing portal session' }, { status: 500 })
  }
}