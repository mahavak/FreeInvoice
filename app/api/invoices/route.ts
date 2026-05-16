import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/invoices
 * List all invoices for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const where: any = { userId: user.id }
    if (status) {
      where.status = status
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          client: {
            select: { name: true, email: true }
          }
        }
      }),
      prisma.invoice.count({ where })
    ])

    return NextResponse.json({
      invoices,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error: any) {
    console.error('[INVOICES_GET_ERROR]:', error.message)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

/**
 * POST /api/invoices
 * Create a new invoice
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { clientId, items, dueDate, taxRate = 0, notes } = await req.json()

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

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (Number(item.quantity) * Number(item.price)), 0)
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    // Generate invoice number
    const lastInvoice = await prisma.invoice.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { number: true }
    })

    const invoiceNumber = lastInvoice 
      ? `INV-${String(parseInt(lastInvoice.number.replace('INV-', '')) + 1).padStart(5, '0')}`
      : 'INV-00001'

    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        clientId,
        number: invoiceNumber,
        dueDate: new Date(dueDate || Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 14 days
        items: JSON.stringify(items), // SQLite stores as string
        taxRate,
        total,
        status: 'draft'
      },
      include: {
        client: true
      }
    })

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error: any) {
    console.error('[INVOICES_CREATE_ERROR]:', error.message)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}