'use client'

import { useState, useEffect } from 'react'
import { Check, X, CreditCard, Loader2 } from 'lucide-react'

interface SubscriptionStatus {
  subscription: {
    tier: string
    tierName: string
    maxInvoices: number
    invoicesUsed: number
    invoicesRemaining: number
    canCreateInvoice: boolean
    currentPeriodEnd: string | null
  }
  user: {
    name: string | null
    email: string | null
  }
}

export function SubscriptionManager() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      const res = await fetch('/api/stripe/subscription')
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch (err) {
      console.error('Failed to fetch subscription status:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (tier: 'pro' | 'agency') => {
    setUpgrading(true)
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Upgrade failed:', err)
    } finally {
      setUpgrading(false)
    }
  }

  const handleManageBilling = async () => {
    try {
      const res = await fetch('/api/stripe/billing-portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Billing portal failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-indigo-600" size={24} />
      </div>
    )
  }

  const tier = status?.subscription?.tier || 'free'
  const tierName = status?.subscription?.tierName || 'Free'
  const invoicesUsed = status?.subscription?.invoicesUsed || 0
  const invoicesRemaining = status?.subscription?.invoicesRemaining || 0
  const maxInvoices = status?.subscription?.maxInvoices || 3
  const canCreate = status?.subscription?.canCreateInvoice ?? true

  return (
    <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-xl">
      {/* Current Plan */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Current Plan</h3>
        <div className="flex items-center gap-4">
          <span className="text-3xl font-black text-indigo-600">{tierName}</span>
          {tier !== 'free' && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-600">
              Active
            </span>
          )}
        </div>
      </div>

      {/* Usage Meter */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">Invoices This Month</span>
          <span className="text-sm font-bold text-gray-900">
            {invoicesUsed} / {maxInvoices === -1 ? '∞' : maxInvoices}
          </span>
        </div>
        {maxInvoices !== -1 && (
          <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                canCreate ? 'bg-indigo-600' : 'bg-red-500'
              }`}
              style={{ width: `${(invoicesUsed / maxInvoices) * 100}%` }}
            />
          </div>
        )}
        {!canCreate && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            ⚠️ You've reached your monthly limit. Upgrade to create more invoices.
          </p>
        )}
      </div>

      {/* Upgrade Options */}
      {tier === 'free' && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Upgrade Options
          </h4>
          
          <button
            onClick={() => handleUpgrade('pro')}
            disabled={upgrading}
            className="w-full flex items-center justify-between rounded-2xl bg-indigo-600 px-6 py-4 text-white font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            <div className="text-left">
              <div className="text-lg">Pro - $9/month</div>
              <div className="text-sm text-indigo-200 font-normal">50 invoices/month</div>
            </div>
            <div className="rounded-full bg-white/20 px-3 py-1 text-xs">
              POPULAR
            </div>
          </button>

          <button
            onClick={() => handleUpgrade('agency')}
            disabled={upgrading}
            className="w-full flex items-center justify-between rounded-2xl border-2 border-gray-200 px-6 py-4 text-gray-900 font-bold hover:border-gray-300 transition-all disabled:opacity-50"
          >
            <div className="text-left">
              <div className="text-lg">Agency - $29/month</div>
              <div className="text-sm text-gray-500 font-normal">Unlimited invoices</div>
            </div>
          </button>
        </div>
      )}

      {/* Manage Billing (for paid users) */}
      {tier !== 'free' && (
        <button
          onClick={handleManageBilling}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-6 py-4 text-gray-700 font-bold hover:bg-gray-50 transition-all"
        >
          <CreditCard size={20} />
          <span>Manage Billing</span>
        </button>
      )}

      {/* Social Impact */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Check size={16} className="text-emerald-500" />
          <span>
            {tier === 'free' 
              ? 'Free tier: Funded by Pro users' 
              : `${tierName} tier: Funding ${tier === 'pro' ? '3' : '15'} free accounts`}
          </span>
        </div>
      </div>
    </div>
  )
}