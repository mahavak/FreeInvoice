'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface FunnelData {
  totalEvents: number
  uniqueVisitors: number
  summary: Record<string, number>
  funnel: {
    pageView: number
    ctaClick: number
    pricingView: number
    checkoutStart: number
    ctaRate: string
    pricingRate: string
    checkoutRate: string
  }
  lastUpdated: string
}

export default function AnalyticsPage() {
  const [data, setData] = useState<FunnelData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-12 text-gray-500">Loading analytics...</div>

  if (!data || data.totalEvents === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-12">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-12 shadow-sm text-center">
          <h1 className="text-3xl font-black mb-4">Analytics Dashboard</h1>
          <p className="text-gray-500 mb-8">No events tracked yet. Traffic will appear here once visitors start arriving.</p>
          <Link href="/" className="text-indigo-600 font-bold hover:underline">&larr; Back to Home</Link>
        </div>
      </div>
    )
  }

  const f = data.funnel

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-black">FreeInvoice Analytics</h1>
          <Link href="/" className="text-sm font-bold text-indigo-600 hover:underline">&larr; Home</Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Events', value: data.totalEvents },
            { label: 'Unique Visitors', value: data.uniqueVisitors },
            { label: 'Page Views', value: f.pageView },
            { label: 'CTA Clicks', value: f.ctaClick },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-gray-400 uppercase">{stat.label}</p>
              <p className="text-3xl font-black mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm mb-8">
          <h2 className="text-xl font-black mb-6">Conversion Funnel</h2>
          <div className="space-y-6">
            {[
              { label: 'Landing Page View', value: f.pageView, rate: '100%' },
              { label: 'CTA Click', value: f.ctaClick, rate: f.ctaRate },
              { label: 'Pricing Page View', value: f.pricingView, rate: f.pricingRate },
              { label: 'Checkout Started', value: f.checkoutStart, rate: f.checkoutRate },
            ].map(step => (
              <div key={step.label} className="flex items-center gap-4">
                <div className="w-40 text-sm font-bold text-gray-500">{step.label}</div>
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: step.rate }}
                  />
                </div>
                <div className="w-20 text-right text-sm font-black">{step.value}</div>
                <div className="w-16 text-right text-xs font-bold text-gray-400">{step.rate}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-black mb-4">Event Breakdown</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(data.summary).map(([k, v]) => (
              <div key={k} className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-bold text-gray-400 uppercase">{k}</p>
                <p className="text-2xl font-black">{v}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-6">Last updated: {data.lastUpdated}</p>
      </div>
    </div>
  )
}
