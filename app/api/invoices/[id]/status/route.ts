import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/invoices/[id]/status
 * Lightweight endpoint used by the /invoices/[id]/paid  confirmation page
 * to poll whether an invoice has been marked as paid after a redirect from Mollie / Stripe.
 */
export async function GET(
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
      select: {
        id:          true,
        number:      true,
        status:      true,
        total:       true,
        paymentUrl:  true,
        paymentMethod: true,
        paidDate:    true,
        updatedAt:   true
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({ invoice })
  } catch (error: any) {
    console.error('[INVOICE_STATUS_ERROR]:', error.message)
    return NextResponse.json(
      { error: 'Failed to fetch invoice status' },
      { status: 500 }
    )
  }
}
