'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, Sparkles, Zap, Shield } from 'lucide-react'

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: '\u20ac',
    period: 'voor altijd',
    description: 'Perfect om FreeInvoice uit te proberen',
    invoices: '3/maand',
    features: [
      '3 facturen per maand',
      'AI-aangedreven generatie',
      'PDF-download',
      'Nederlandse & Engelse sjablonen',
      'BTW & IBAN automatisch'
    ],
    cta: 'Gratis beginnen',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9,
    currency: '\u20ac',
    period: '/maand',
    description: 'Voor ZZP\'ers en kleine bedrijven',
    invoices: '50/maand',
    features: [
      '50 facturen per maand',
      'Alle Free-functies',
      'Klantbeheer',
      'Factuurhistorie',
      'E-mail levering',
      'Prioriteitsondersteuning',
      '1-for-3 Sociale Impact'
    ],
    cta: 'Pro proberen',
    popular: true
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 29,
    currency: '\u20ac',
    period: '/maand',
    description: 'Voor teams en bureaus',
    invoices: 'Onbeperkt',
    features: [
      'Onbeperkte facturen',
      'Alle Pro-functies',
      'White-label facturen',
      'API-toegang',
      '5 teamleden',
      'Custom huisstijl',
      'Dedicated support',
      '5-for-15 Sociale Impact'
    ],
    cta: 'Agency kiezen',
    popular: false
  }
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'pricing_view', page: '/pricing' }),
    }).catch(() => {})
  }, [])


  const handleSubscribe = async (tier: string) => {
    if (tier === 'free') {
      window.location.href = '/dashboard'
      return
    }

    setLoading(tier)
    try {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'checkout_start', page: '/pricing', metadata: { tier } }),
      }).catch(() => {})
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      })

      const data = await res.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Error: ' + (data.error || 'Failed to create checkout session'))
      }
    } catch (err) {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-8 lg:px-12">
        <Link href="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter text-indigo-600">
          <Sparkles className="fill-current" />
          <span>FreeInvoice</span>
        </Link>
        <Link href="/dashboard" className="text-sm font-bold text-gray-500 hover:text-gray-900">
          Dashboard →
        </Link>
      </nav>

      {/* Hero */}
      <div className="px-6 py-16 lg:px-12 lg:py-24 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-600">
          <Zap size={16} />
          <span>Bespaar &euro; per factuur met lokale AI</span>
        </div>
        <h1 className="mb-6 text-4xl font-black tracking-tight text-gray-900 lg:text-6xl">
          Eerlijke, transparante prijzen
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-gray-500">
          Start gratis, schaal mee. Elk Pro-abonnement financiert 3 gratis accounts voor freelancers in ontwikkelingslanden.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="px-6 pb-24 lg:px-12">
        <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-[32px] p-8 ${
                tier.popular 
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-200' 
                  : 'bg-gray-50 text-gray-900'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-4 py-1 text-xs font-bold text-white">
                  POPULAIR
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold">{tier.name}</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-5xl font-black">{tier.currency || '\u20ac'}{tier.price}</span>
                  <span className={tier.popular ? 'text-indigo-200' : 'text-gray-500'}>
                    {tier.period}
                  </span>
                </div>
                <p className={`mt-2 text-sm ${tier.popular ? 'text-indigo-100' : 'text-gray-500'}`}>
                  {tier.description}
                </p>
              </div>

              <div className={`mb-6 rounded-xl ${tier.popular ? 'bg-indigo-500/50' : 'bg-white'} p-4`}>
                <span className="text-sm font-bold">
                  {tier.invoices} invoices
                </span>
              </div>

              <ul className="mb-8 space-y-3">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check size={20} className={`mt-0.5 shrink-0 ${tier.popular ? 'text-indigo-200' : 'text-emerald-500'}`} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(tier.id)}
                disabled={loading === tier.id}
                className={`w-full rounded-2xl py-4 font-bold transition-all ${
                  tier.popular
                    ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } ${loading === tier.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading === tier.id ? 'Loading...' : tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Social Impact Section */}
      <div className="bg-gray-50 px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <Shield className="mx-auto mb-6 text-emerald-500" size={48} />
          <h2 className="mb-4 text-3xl font-black text-gray-900">
            1-for-3 Social Impact Model
          </h2>
          <p className="text-lg text-gray-500">
            For every Pro subscription, we fund 3 free accounts for freelancers in developing countries.
            Your subscription directly enables global creators to access professional tools they couldn't otherwise afford.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-12 lg:px-12">
        <div className="mx-auto max-w-6xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-lg font-black tracking-tighter text-indigo-600">
            <Sparkles className="fill-current" size={20} />
            <span>FreeInvoice</span>
          </div>
          <p className="text-sm text-gray-400">
            © 2026 FreeInvoice. Powered by local AI.
          </p>
        </div>
      </footer>
    </div>
  )
}