import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/invoices/[id]
 * Get a specific invoice with full details
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
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
        client: true,
        user: {
          select: { name: true, email: true }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({ invoice })
  } catch (error: any) {
    console.error('[INVOICE_GET_ERROR]:', error.message)
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 })
  }
}

/**
 * PUT /api/invoices/[id]
 * Update an invoice (status, items, etc.)
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const updates = await req.json()

    // Verify ownership
    const existing = await prisma.invoice.findFirst({
      where: { 
        id,
        user: { email: session.user.email }
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}

    if (updates.status) {
      updateData.status = updates.status
    }

    if (updates.items && Array.isArray(updates.items)) {
      updateData.items = updates.items
      // Recalculate total
      const subtotal = updates.items.reduce((sum: number, item: any) => 
        sum + (Number(item.quantity) * Number(item.price)), 0)
      const taxAmount = subtotal * ((updates.taxRate ?? existing.taxRate) / 100)
      updateData.total = subtotal + taxAmount
    }

    if (updates.taxRate !== undefined) {
      updateData.taxRate = updates.taxRate
    }

    if (updates.dueDate) {
      updateData.dueDate = new Date(updates.dueDate)
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: { client: true }
    })

    return NextResponse.json({ invoice })
  } catch (error: any) {
    console.error('[INVOICE_UPDATE_ERROR]:', error.message)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

/**
 * DELETE /api/invoices/[id]
 * Delete an invoice
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const existing = await prisma.invoice.findFirst({
      where: { 
        id,
        user: { email: session.user.email }
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    await prisma.invoice.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[INVOICE_DELETE_ERROR]:', error.message)
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}