'use client'

import { useState, useEffect } from 'react'
import { FileText, Clock, CheckCircle, AlertCircle, Send, Eye, Trash2, Loader2, DollarSign } from 'lucide-react'

interface InvoiceItem {
  description: string
  quantity: number
  price: number
}

interface Invoice {
  id: string
  number: string
  status: string
  total: number
  taxRate: number
  dueDate: string
  createdAt: string
  items: InvoiceItem[]
  client: {
    name: string
    email: string
  }
}

interface InvoiceHistoryProps {
  onSelectInvoice?: (invoice: Invoice) => void
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: FileText },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-600', icon: Send },
  paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-600', icon: AlertCircle },
}

export function InvoiceHistory({ onSelectInvoice }: InvoiceHistoryProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    totalRevenue: 0
  })

  useEffect(() => {
    fetchInvoices()
  }, [statusFilter])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const url = statusFilter 
        ? `/api/invoices?status=${statusFilter}`
        : '/api/invoices'
      
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setInvoices(data.invoices)
        
        // Calculate stats
        const total = data.invoices.length
        const paid = data.invoices.filter((i: Invoice) => i.status === 'paid').length
        const pending = data.invoices.filter((i: Invoice) => i.status === 'sent').length
        const overdue = data.invoices.filter((i: Invoice) => i.status === 'overdue').length
        const totalRevenue = data.invoices
          .filter((i: Invoice) => i.status === 'paid')
          .reduce((sum: number, i: Invoice) => sum + i.total, 0)
        
        setStats({ total, paid, pending, overdue, totalRevenue })
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (res.ok) {
        fetchInvoices()
      }
    } catch (err) {
      alert('Failed to update status')
    }
  }

  const deleteInvoice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setInvoices(invoices.filter(i => i.id !== id))
      }
    } catch (err) {
      alert('Failed to delete invoice')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-indigo-600" size={24} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-gray-100 p-4">
          <div className="text-sm text-gray-500 mb-1">Total Invoices</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
          <div className="text-sm text-emerald-600 mb-1">Paid</div>
          <div className="text-2xl font-bold text-emerald-700">{stats.paid}</div>
        </div>
        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
          <div className="text-sm text-blue-600 mb-1">Pending</div>
          <div className="text-2xl font-bold text-blue-700">{stats.pending}</div>
        </div>
        <div className="rounded-2xl bg-indigo-600 border border-indigo-500 p-4">
          <div className="text-sm text-indigo-200 mb-1">Revenue</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setStatusFilter(null)}
          className={`rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-all ${
            statusFilter === null 
              ? 'bg-gray-900 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? null : key)}
            className={`rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-all ${
              statusFilter === key 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Invoice List */}
      {invoices.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-[32px]">
          <FileText className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No invoices yet</h3>
          <p className="text-gray-500">Create your first invoice to see it here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => {
            const statusConfig = STATUS_CONFIG[invoice.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft
            const StatusIcon = statusConfig.icon
            
            return (
              <div
                key={invoice.id}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-gray-900">{invoice.number}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${statusConfig.color}`}>
                        <StatusIcon size={12} />
                        {statusConfig.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{invoice.client.name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        Due {formatDate(invoice.dueDate)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      {invoice.items.slice(0, 3).map((item, i) => (
                        <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {item.description.substring(0, 20)}...
                        </span>
                      ))}
                      {invoice.items.length > 3 && (
                        <span className="text-xs text-gray-400">+{invoice.items.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(invoice.total)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Created {formatDate(invoice.createdAt)}
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-3">
                      {onSelectInvoice && (
                        <button
                          onClick={() => onSelectInvoice(invoice)}
                          className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      {invoice.status === 'draft' && (
                        <button
                          onClick={() => updateStatus(invoice.id, 'sent')}
                          className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                        >
                          <Send size={16} />
                        </button>
                      )}
                      {invoice.status === 'sent' && (
                        <button
                          onClick={() => updateStatus(invoice.id, 'paid')}
                          className="rounded-lg bg-emerald-100 p-2 text-emerald-600 hover:bg-emerald-200"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteInvoice(invoice.id)}
                        className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}