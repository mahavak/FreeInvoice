import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe, SUBSCRIPTION_TIERS } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events for subscription management
 */
export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    console.error('[WEBHOOK_SIGNATURE_ERROR]:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[WEBHOOK_ERROR]:', error.message)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

/**
 * Handle successful checkout completion
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const tier = session.metadata?.tier as string

  if (!userId || !tier) return

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionType: tier,
      stripeSubscriptionId: session.subscription as string,
      stripeCustomerId: session.customer as string,
    }
  })

  console.log(`[WEBHOOK] User ${userId} subscribed to ${tier}`)
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId }
  })

  if (!user) return

  // Determine tier from price ID
  const priceId = subscription.items.data[0]?.price.id
  let newTier = 'free'

  for (const [tierKey, tierConfig] of Object.entries(SUBSCRIPTION_TIERS)) {
    if (tierConfig.stripePriceId === priceId) {
      newTier = tierKey
      break
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionType: newTier,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    }
  })
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId }
  })

  if (!user) return

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionType: 'free',
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
    }
  })

  console.log(`[WEBHOOK] User ${user.id} subscription cancelled`)
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId }
  })

  if (!user) return

  // Reset invoice count on successful payment
  await prisma.user.update({
    where: { id: user.id },
    data: {
      invoicesThisMonth: 0,
      lastInvoiceReset: new Date(),
    }
  })

  // Create social impact credit (1-for-3 model)
  if (user.subscriptionType !== 'free') {
    await prisma.socialImpactCredit.create({
      data: {
        sponsorId: user.id,
        beneficiaryId: null,
      }
    })
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId }
  })

  if (!user) return

  console.log(`[WEBHOOK] Payment failed for user ${user.id}`)
  // Could send email notification here
}