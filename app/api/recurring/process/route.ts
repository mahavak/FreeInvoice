import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/recurring/process
 * Process all due recurring invoices
 *
 * Called by Vercel Cron (daily at midnight) or manually with CRON_SECRET.
 * Vercel Cron does not send custom headers, so we accept the secret
 * via either the x-cron-secret header or the ?cron_secret= query param.
 */
function verifyCronAuth(req: NextRequest): boolean {
  // Allow Vercel Cron requests (they include x-vercel-cron header)
  if (req.headers.get('x-vercel-cron') === 'true') return true
  // Allow manual invocation with CRON_SECRET
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const headerSecret = req.headers.get('x-cron-secret')
  const querySecret = req.nextUrl.searchParams.get('cron_secret')
  return headerSecret === secret || querySecret === secret
}

export async function POST(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const processed: string[] = []
    const errors: string[] = []

    // Find all recurring invoices that are due
    const dueInvoices = await prisma.invoice.findMany({
      where: {
        isRecurring: true,
        nextInvoiceDate: { lte: now },
        OR: [
          { recurringEndDate: null },
          { recurringEndDate: { gte: now } }
        ]
      },
      include: {
        client: true,
        user: true
      }
    })

    console.log(`[RECURRING] Found ${dueInvoices.length} due invoices`)

    for (const template of dueInvoices) {
      try {
        // Create new invoice from template
        const invoiceNumber = await generateInvoiceNumber(template.userId)
        
        const newInvoice = await prisma.invoice.create({
          data: {
            userId: template.userId,
            clientId: template.clientId,
            number: invoiceNumber,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
            items: template.items,
            taxRate: template.taxRate,
            total: template.total,
            status: 'draft',
            parentInvoiceId: template.id,
          }
        })

        // Update next invoice date for template
        const nextDate = calculateNextInvoiceDate(
          now,
          template.recurringInterval || 'monthly',
          template.recurringDay || 1
        )

        await prisma.invoice.update({
          where: { id: template.id },
          data: { nextInvoiceDate: nextDate }
        })

        processed.push(template.number)
        console.log(`[RECURRING] Created invoice ${invoiceNumber} from template ${template.number}`)

      } catch (err: any) {
        errors.push(`${template.number}: ${err.message}`)
        console.error(`[RECURRING_ERROR] ${template.number}:`, err.message)
      }
    }

    return NextResponse.json({
      success: true,
      processed: processed.length,
      errors: errors.length,
      details: { processed, errors }
    })

  } catch (error: any) {
    console.error('[RECURRING_PROCESS_ERROR]:', error.message)
    return NextResponse.json({ error: 'Failed to process recurring invoices' }, { status: 500 })
  }
}

/**
 * Generate sequential invoice number
 */
async function generateInvoiceNumber(userId: string): Promise<string> {
  const lastInvoice = await prisma.invoice.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { number: true }
  })

  if (!lastInvoice) {
    return 'INV-00001'
  }

  const lastNumber = parseInt(lastInvoice.number.replace(/\D/g, '')) || 0
  return `INV-${String(lastNumber + 1).padStart(5, '0')}`
}

/**
 * Calculate next invoice date
 */
function calculateNextInvoiceDate(from: Date, interval: string, day: number): Date {
  const next = new Date(from)
  
  switch (interval) {
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      next.setDate(day)
      break
    case 'quarterly':
      next.setMonth(next.getMonth() + 3)
      next.setDate(day)
      break
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1)
      next.setDate(day)
      break
    default:
      next.setMonth(next.getMonth() + 1)
  }
  
  return next
}

/**
 * GET /api/recurring/process
 * Health check for recurring invoice processing
 */
export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const dueCount = await prisma.invoice.count({
    where: {
      isRecurring: true,
      nextInvoiceDate: { lte: now },
      OR: [
        { recurringEndDate: null },
        { recurringEndDate: { gte: now } }
      ]
    }
  })

  return NextResponse.json({
    status: 'ok',
    dueInvoices: dueCount,
    nextRun: 'midnight UTC'
  })
}