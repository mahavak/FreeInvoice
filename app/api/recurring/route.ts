import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/recurring
 * List all recurring invoice templates for the user
 */
export async function GET() {
  try {
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

    const recurring = await prisma.invoice.findMany({
      where: {
        userId: user.id,
        isRecurring: true
      },
      include: {
        client: {
          select: { name: true, email: true }
        }
      },
      orderBy: { nextInvoiceDate: 'asc' }
    })

    return NextResponse.json({ recurring })
  } catch (error: any) {
    console.error('[RECURRING_GET_ERROR]:', error.message)
    return NextResponse.json({ error: 'Failed to fetch recurring invoices' }, { status: 500 })
  }
}

/**
 * POST /api/recurring
 * Create a new recurring invoice template
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      clientId, 
      items, 
      taxRate = 0, 
      interval = 'monthly',
      day = 1,
      endDate 
    } = await req.json()

    if (!clientId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Client and items are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify client belongs to user
    const client = await prisma.client.findFirst({
      where: { id: clientId, userId: user.id }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Calculate total
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (Number(item.quantity) * Number(item.price)), 0)
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    // Calculate next invoice date
    const now = new Date()
    const nextInvoiceDate = calculateNextInvoiceDate(now, interval, day)

    // Generate invoice number
    const lastInvoice = await prisma.invoice.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { number: true }
    })

    const invoiceNumber = lastInvoice 
      ? `REC-${String(parseInt(lastInvoice.number.replace(/\D/g, '')) + 1).padStart(5, '0')}`
      : 'REC-00001'

    const recurring = await prisma.invoice.create({
      data: {
        userId: user.id,
        clientId,
        number: invoiceNumber,
        dueDate: nextInvoiceDate,
        items: JSON.stringify(items), // SQLite stores as string
        taxRate,
        total,
        status: 'draft',
        isRecurring: true,
        recurringInterval: interval,
        recurringDay: day,
        nextInvoiceDate,
        recurringEndDate: endDate ? new Date(endDate) : null,
      },
      include: {
        client: true
      }
    })

    return NextResponse.json({ recurring }, { status: 201 })
  } catch (error: any) {
    console.error('[RECURRING_CREATE_ERROR]:', error.message)
    return NextResponse.json({ error: 'Failed to create recurring invoice' }, { status: 500 })
  }
}

/**
 * Calculate next invoice date based on interval
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