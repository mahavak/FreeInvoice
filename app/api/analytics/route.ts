import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/analytics
 * Returns funnel summary from tracked events stored in the database.
 */
export async function GET() {
  try {
    const events = await prisma.analyticsEvent.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10000,
    })

    const summary: Record<string, number> = {}
    const uniqueIps = new Set<string>()
    for (const ev of events) {
      summary[ev.eventType] = (summary[ev.eventType] || 0) + 1
      uniqueIps.add(ev.ip)
    }

    const pageView = summary['page_view'] || 0
    const ctaClick = summary['cta_click'] || 0
    const pricingView = summary['pricing_view'] || 0
    const checkoutStart = summary['checkout_start'] || 0

    return NextResponse.json({
      totalEvents: events.length,
      uniqueVisitors: uniqueIps.size,
      summary,
      funnel: {
        pageView,
        ctaClick,
        pricingView,
        checkoutStart,
        ctaRate: pageView ? ((ctaClick / pageView) * 100).toFixed(1) + '%' : '0%',
        pricingRate: pageView ? ((pricingView / pageView) * 100).toFixed(1) + '%' : '0%',
        checkoutRate: pricingView ? ((checkoutStart / pricingView) * 100).toFixed(1) + '%' : '0%',
      },
      lastUpdated: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('[ANALYTICS_ERROR]', err.message)
    return NextResponse.json({ error: 'Analytics read failed' }, { status: 500 })
  }
}
