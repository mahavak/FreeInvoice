import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/clients
 * List all clients for the authenticated user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        clients: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { invoices: true } }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ clients: user.clients })
  } catch (error: any) {
    console.error('[CLIENTS_GET_ERROR]:', error.message)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

/**
 * POST /api/clients
 * Create a new client
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, address } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        address: address || null,
        userId: user.id
      }
    })

    return NextResponse.json({ client }, { status: 201 })
  } catch (error: any) {
    console.error('[CLIENTS_CREATE_ERROR]:', error.message)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}