import { authOptions } from "../api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, FileText, Users, Globe, TrendingUp, Sparkles } from 'lucide-react'

/**
 * FreeInvoice Dashboard
 * Author: Senior AI Engineering Collaborator
 * Features: Stat summaries, Impact tracker, Recent activity.
 */
export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  // SaaS Auth Guard
  if (!session) {
    redirect("/api/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-12">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <header className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900">Control Center</h1>
            <p className="mt-1 text-sm font-medium text-gray-500">Welcome back, {session.user?.name}</p>
          </div>
          <Link 
            href="/invoices/new"
            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-95"
          >
            <Plus size={20} />
            <span>New Invoice</span>
          </Link>
        </header>

        {/* Global Stats Dashboard */}
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Revenue" value="$0.00" icon={<TrendingUp size={20} />} />
          <StatCard label="Active Clients" value="0" icon={<Users size={20} />} />
          <StatCard label="Total Invoices" value="0" icon={<FileText size={20} />} />
          <StatCard label="Impact Score" value="0" icon={<Globe size={20} />} isImpact />
        </div>

        {/* "1-for-3" Social Impact Banner */}
        <div className="relative mb-10 overflow-hidden rounded-3xl bg-indigo-900 p-8 text-white shadow-2xl">
          <div className="relative z-10 flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
            <div className="max-w-xl text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-indigo-100 backdrop-blur-sm">
                <Sparkles size={14} />
                <span>Social Impact Model</span>
              </div>
              <h2 className="mb-4 text-3xl font-black tracking-tight">The 1-for-3 Mission</h2>
              <p className="text-lg text-indigo-100/80 leading-relaxed">
                As a Pro member, your monthly subscription directly funds **3 free accounts** for freelancers in developing countries. You are currently supporting **0** creators globally.
              </p>
            </div>
            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-white/10 text-white shadow-inner backdrop-blur-md">
              <Globe size={64} className="animate-pulse" />
            </div>
          </div>
          {/* Decorative Background Elements */}
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full bg-indigo-400/10 blur-2xl" />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Invoice Feed */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Recent Invoices</h3>
                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</button>
              </div>
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-6 rounded-3xl bg-gray-50 p-6 text-gray-300">
                  <FileText size={48} />
                </div>
                <p className="text-lg font-bold text-gray-900">No activity yet</p>
                <p className="mt-2 text-sm text-gray-500">Your professional invoices will appear here once generated.</p>
              </div>
            </div>
          </div>

          {/* Quick Actions / Sidebar */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
              <h3 className="mb-6 text-lg font-bold text-gray-900">Quick Actions</h3>
              <div className="space-y-3">
                <ActionButton label="Add Client" icon={<Users size={18} />} />
                <ActionButton label="Update Branding" icon={<Sparkles size={18} />} />
              </div>
            </div>
            
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/30 p-8 text-center backdrop-blur-sm">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-700 mb-2">Upgrade Status</p>
              <p className="text-sm font-medium text-emerald-900">You are currently on the <span className="font-bold">Free Tier</span>. (3/mo remaining)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, isImpact = false }: any) {
  return (
    <div className="group rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-50">
      <div className="mb-6 flex items-center justify-between">
        <div className={`rounded-2xl p-3.5 shadow-sm transition-colors ${isImpact ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
          {icon}
        </div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-gray-900">{value}</p>
    </div>
  )
}

function ActionButton({ label, icon }: any) {
  return (
    <button className="flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 text-sm font-bold text-gray-700 transition-all hover:bg-white hover:shadow-md active:scale-95">
      <span className="text-indigo-600">{icon}</span>
      <span>{label}</span>
    </button>
  )
}
