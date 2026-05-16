import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/invoices/[id]/payment-link
 * Generate a one-click payment link for an invoice using Stripe.
 *
 * The generated link is persisted on the invoice row so the send route
 * can render a "Pay Now" CTA in emails.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        user: { email: session.user.email }
      },
      include: {
        client: { select: { name: true, email: true } },
        user:   { select: { name: true, email: true } }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 })
    }

    // Re-use existing link if it is still fresh (less than 7 days old)
    if (invoice.paymentUrl && invoice.updatedAt) {
      const ageDays = (Date.now() - new Date(invoice.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      if (ageDays < 7) {
        return NextResponse.json({
          paymentUrl: invoice.paymentUrl,
          method:   invoice.paymentMethod || 'unknown',
          fromCache: true
        })
      }
    }

    const description = `Invoice ${invoice.number} — ${invoice.client?.name || 'Client'}`

    // Create Stripe Payment Link
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) {
      return NextResponse.json(
        { error: 'No payment provider configured. Set STRIPE_SECRET_KEY in .env' },
        { status: 503 }
      )
    }

    const stripeRes = await fetch('https://api.stripe.com/v1/payment_links', {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'line_items[0][quantity]': '1',
        'line_items[0][price_data][currency]': 'eur',
        'line_items[0][price_data][unit_amount]': String(Math.round(invoice.total * 100)),
        'line_items[0][price_data][product_data][name]': description,
        'after_completion[type]': 'redirect',
        'after_completion[redirect][url]': `${process.env.NEXTAUTH_URL}/invoices/${invoice.id}/paid`
      })
    })

    if (!stripeRes.ok) {
      console.error('[PAYMENT_LINK] Stripe failed:', await stripeRes.text())
      return NextResponse.json({ error: 'Failed to create payment link' }, { status: 502 })
    }

    const data = await stripeRes.json()
    const paymentUrl = data.url
    const method = 'stripe'

    // Persist on the invoice record
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        paymentUrl:    paymentUrl,
        paymentMethod: method
      }
    })

    return NextResponse.json({
      paymentUrl,
      method,
      fromCache: false
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[PAYMENT_LINK_ERROR]:', message)
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    )
  }
}
