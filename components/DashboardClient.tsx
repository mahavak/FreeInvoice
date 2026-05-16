'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Users, TrendingUp, Globe, Sparkles, Loader2 } from 'lucide-react'
import { SubscriptionManager } from './SubscriptionManager'
import { InvoiceHistory } from './InvoiceHistory'
import { ClientManager } from './ClientManager'

interface DashboardStats {
  revenue: number
  clients: number
  invoices: number
  impactScore: number
  subscription: {
    tier: string
    tierName: string
    invoicesRemaining: number
  }
}

type ActiveView = 'dashboard' | 'invoices' | 'clients' | 'subscription'

export function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch subscription status
      const subRes = await fetch('/api/stripe/subscription')
      if (subRes.ok) {
        const subData = await subRes.json()
        
        // Fetch clients count
        const clientsRes = await fetch('/api/clients')
        const clientsData = clientsRes.ok ? await clientsRes.json() : { clients: [] }
        
        // Fetch invoices
        const invoicesRes = await fetch('/api/invoices')
        const invoicesData = invoicesRes.ok ? await invoicesRes.json() : { invoices: [] }
        
        const paidInvoices = invoicesData.invoices?.filter((i: any) => i.status === 'paid') || []
        const totalRevenue = paidInvoices.reduce((sum: number, i: any) => sum + i.total, 0)
        
        setStats({
          revenue: totalRevenue,
          clients: clientsData.clients?.length || 0,
          invoices: invoicesData.invoices?.length || 0,
          impactScore: subData.subscription?.tier === 'pro' ? 3 : subData.subscription?.tier === 'agency' ? 15 : 0,
          subscription: subData.subscription
        })
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tighter text-indigo-600">
                <Sparkles className="fill-current" size={24} />
                <span>FreeInvoice</span>
              </Link>
              <div className="hidden md:flex items-center gap-1">
                <NavButton active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')}>
                  Dashboard
                </NavButton>
                <NavButton active={activeView === 'invoices'} onClick={() => setActiveView('invoices')}>
                  Invoices
                </NavButton>
                <NavButton active={activeView === 'clients'} onClick={() => setActiveView('clients')}>
                  Clients
                </NavButton>
                <NavButton active={activeView === 'subscription'} onClick={() => setActiveView('subscription')}>
                  Subscription
                </NavButton>
              </div>
            </div>
            <Link
              href="/invoices/new"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-all"
            >
              <FileText size={18} />
              <span className="hidden sm:inline">New Invoice</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <div className="md:hidden border-b border-gray-100 bg-white px-4 py-2 flex gap-2 overflow-x-auto">
        <NavButton small active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')}>
          Dashboard
        </NavButton>
        <NavButton small active={activeView === 'invoices'} onClick={() => setActiveView('invoices')}>
          Invoices
        </NavButton>
        <NavButton small active={activeView === 'clients'} onClick={() => setActiveView('clients')}>
          Clients
        </NavButton>
        <NavButton small active={activeView === 'subscription'} onClick={() => setActiveView('subscription')}>
          Plan
        </NavButton>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {activeView === 'dashboard' && (
          <DashboardView stats={stats} />
        )}
        {activeView === 'invoices' && (
          <InvoiceHistory />
        )}
        {activeView === 'clients' && (
          <ClientManager />
        )}
        {activeView === 'subscription' && (
          <SubscriptionView stats={stats} />
        )}
      </main>
    </div>
  )
}

function NavButton({ children, active, onClick, small }: any) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-bold whitespace-nowrap transition-all ${
        small ? 'text-xs px-3 py-1.5' : ''
      } ${
        active
          ? 'bg-indigo-100 text-indigo-700'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  )
}

function DashboardView({ stats }: { stats: DashboardStats | null }) {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={`$${(stats?.revenue || 0).toFixed(2)}`} icon={<TrendingUp size={20} />} />
        <StatCard label="Clients" value={stats?.clients || 0} icon={<Users size={20} />} />
        <StatCard label="Invoices" value={stats?.invoices || 0} icon={<FileText size={20} />} />
        <StatCard label="Impact" value={stats?.impactScore || 0} icon={<Globe size={20} />} isImpact />
      </div>

      {/* Usage Banner */}
      {stats?.subscription && (
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-200">Current Plan</p>
              <p className="text-2xl font-bold">{stats.subscription.tierName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-indigo-200">Invoices Remaining</p>
              <p className="text-2xl font-bold">
                {stats.subscription.invoicesRemaining === -1 ? '∞' : stats.subscription.invoicesRemaining}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/invoices/new"
          className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-6 hover:shadow-lg transition-all"
        >
          <div className="rounded-xl bg-indigo-100 p-3">
            <FileText className="text-indigo-600" size={24} />
          </div>
          <div>
            <p className="font-bold text-gray-900">Create Invoice</p>
            <p className="text-sm text-gray-500">AI-powered generation</p>
          </div>
        </Link>
        <Link
          href="/pricing"
          className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-6 hover:shadow-lg transition-all"
        >
          <div className="rounded-xl bg-emerald-100 p-3">
            <Sparkles className="text-emerald-600" size={24} />
          </div>
          <div>
            <p className="font-bold text-gray-900">Upgrade Plan</p>
            <p className="text-sm text-gray-500">More features, more impact</p>
          </div>
        </Link>
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-6 hover:shadow-lg transition-all"
        >
          <div className="rounded-xl bg-gray-100 p-3">
            <Users className="text-gray-600" size={24} />
          </div>
          <div>
            <p className="font-bold text-gray-900">Manage Account</p>
            <p className="text-sm text-gray-500">Profile & settings</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

function SubscriptionView({ stats }: { stats: DashboardStats | null }) {
  return (
    <div className="max-w-2xl mx-auto">
      <SubscriptionManager />
    </div>
  )
}

function StatCard({ label, value, icon, isImpact = false }: any) {
  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-xl p-3 ${isImpact ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
          {icon}
        </div>
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-gray-900">{value}</p>
    </div>
  )
}