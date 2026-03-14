import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import Stripe from 'stripe';

/**
 * Stripe Checkout Bridge: FreeInvoice -> Payments
 * Author: Senior AI Engineering Collaborator
 * Purpose: Securely manage Pro/Agency subscriptions with "1-for-3" metadata.
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2026-02-25.clover',
});

export async function POST(req: Request) {
  // Gating: Ensure only logged-in users can initiate checkout
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tier } = await req.json(); // expect "pro" or "agency"
  
  // Tier Mappings (Replace with real Stripe Price IDs in .env)
  const PRICE_MAP: Record<string, string | undefined> = {
    pro: process.env.STRIPE_PRO_PRICE_ID,
    agency: process.env.STRIPE_AGENCY_PRICE_ID,
  };

  const priceId = PRICE_MAP[tier];

  try {
    // 1. Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId || 'price_mock_id', 
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=canceled`,
      metadata: {
        userId: (session.user as any).id,
        tier: tier,
      },
      customer_email: session.user.email || undefined,
    });

    if (!checkoutSession.url) {
      throw new Error("Stripe session URL creation failed.");
    }

    return NextResponse.json({ url: checkoutSession.url });

  } catch (error: any) {
    console.error("[STRIPE_CHECKOUT_ERROR]:", error.message);
    
    // Fallback for development/demo if no real Stripe keys are set
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=mock_success`,
        message: "Development Mock: Success redirect simulated."
      });
    }

    return NextResponse.json(
      { error: "Stripe integration error. Check server logs." }, 
      { status: 500 }
    );
  }
}
