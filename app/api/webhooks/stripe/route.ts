import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from "@/lib/prisma";

/**
 * Stripe Webhook Handler: FreeInvoice
 * Author: Senior AI Engineering Collaborator
 * Purpose: Update user subscription status and track "1-for-3" social impact.
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2026-02-25.clover',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    // 1. Verify Webhook Signature (Production)
    if (process.env.NODE_ENV === 'production') {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } else {
        // In local development, we manually parse the event
        event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error(`[WEBHOOK_ERROR]: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // 2. Handle Subscription Completion
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier;

    if (userId) {
      // Impact logic: "1-for-3" model
      // Pro tier funds 3 free accounts. Agency tier funds 9.
      const credits = tier === 'pro' ? 3 : tier === 'agency' ? 9 : 0;

      try {
        await prisma.user.update({
          where: { id: userId },
          data: { 
            subscriptionType: tier || 'pro',
            creditsGenerated: {
              increment: credits
            },
            stripeCustomerId: session.customer as string,
          },
        });
        
        // Record the credit generation in the impact model
        // In a real implementation, we would now assign these credits to eligible beneficiaries.
        console.log(`[STRIPE_WEBHOOK_SUCCESS]: User ${userId} upgraded. Generated ${credits} impact credits.`);
      } catch (dbError) {
        console.error("[DB_WEBHOOK_UPDATE_ERROR]:", dbError);
        return NextResponse.json({ error: "Failed to update user database." }, { status: 500 });
      }
    }
  }

  // Handle Subscription Cancellation
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const stripeCustomerId = subscription.customer as string;

    await prisma.user.update({
      where: { stripeCustomerId },
      data: { 
        subscriptionType: 'free',
      },
    });
    console.log(`[STRIPE_WEBHOOK_CANCELED]: Subscription for customer ${stripeCustomerId} revoked.`);
  }

  return NextResponse.json({ received: true });
}
