import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/clients/[id]
 * Get a specific client
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const client = await prisma.client.findFirst({
      where: { 
        id,
        user: { email: session.user.email }
      },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: { select: { invoices: true } }
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json({ client })
  } catch (error: any) {
    console.error('[CLIENT_GET_ERROR]:', error.message)
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 })
  }
}

/**
 * PUT /api/clients/[id]
 * Update a client
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { name, email, address } = await req.json()

    // Verify ownership
    const existing = await prisma.client.findFirst({
      where: { 
        id,
        user: { email: session.user.email }
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        name: name || existing.name,
        email: email || existing.email,
        address: address !== undefined ? address : existing.address
      }
    })

    return NextResponse.json({ client })
  } catch (error: any) {
    console.error('[CLIENT_UPDATE_ERROR]:', error.message)
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
  }
}

/**
 * DELETE /api/clients/[id]
 * Delete a client
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const existing = await prisma.client.findFirst({
      where: { 
        id,
        user: { email: session.user.email }
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    await prisma.client.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[CLIENT_DELETE_ERROR]:', error.message)
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}