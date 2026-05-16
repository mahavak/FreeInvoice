import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { stripe, SUBSCRIPTION_TIERS, TierKey } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/stripe/create-checkout-session
 * Creates a Stripe checkout session for subscription
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tier } = await req.json()
    
    if (!tier || !['pro', 'agency'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const tierConfig = SUBSCRIPTION_TIERS[tier as TierKey]
    
    if (!tierConfig.stripePriceId) {
      return NextResponse.json({ error: 'Tier not available' }, { status: 400 })
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || null,
        }
      })
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: user.id,
        }
      })
      customerId = customer.id
      
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      })
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: tierConfig.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pricing?subscription=cancelled`,
      metadata: {
        userId: user.id,
        tier: tier,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error: any) {
    console.error('[STRIPE_CHECKOUT_ERROR]:', error.message)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}