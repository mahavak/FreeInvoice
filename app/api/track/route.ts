import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/track
 * Lightweight analytics event tracking — no cookies, no PII.
 * Stores events in the database for serverless compatibility.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, page, metadata = {} } = body

    if (!event || typeof event !== 'string') {
      return NextResponse.json({ error: 'Missing event name' }, { status: 400 })
    }

    await prisma.analyticsEvent.create({
      data: {
        eventType: event,
        path: page || req.headers.get('referer') || 'unknown',
        ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
        userAgent: req.headers.get('user-agent') || '',
        metadata: JSON.stringify(metadata),
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[TRACK_ERROR]', err.message)
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 })
  }
}
