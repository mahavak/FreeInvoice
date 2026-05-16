'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Plus, Calendar, Clock, Trash2, Loader2 } from 'lucide-react'

interface RecurringInvoice {
  id: string
  number: string
  recurringInterval: string
  recurringDay: number | null
  nextInvoiceDate: string | null
  recurringEndDate: string | null
  status: string
  total: number
  client: {
    name: string
    email: string
  }
  items: Array<{ description: string; quantity: number; price: number }>
}

export function RecurringManager() {
  const [recurring, setRecurring] = useState<RecurringInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    fetchRecurring()
    fetchClients()
  }, [])

  const fetchRecurring = async () => {
    try {
      const res = await fetch('/api/recurring')
      if (res.ok) {
        const data = await res.json()
        setRecurring(data.recurring)
      }
    } catch (err) {
      console.error('Failed to fetch recurring:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients)
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err)
    }
  }

  const deleteRecurring = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recurring invoice?')) return
    
    try {
      const res = await fetch(`/api/recurring/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setRecurring(recurring.filter(r => r.id !== id))
      }
    } catch (err) {
      alert('Failed to delete recurring invoice')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
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

  const getIntervalLabel = (interval: string) => {
    switch (interval) {
      case 'weekly': return 'Weekly'
      case 'monthly': return 'Monthly'
      case 'quarterly': return 'Quarterly'
      case 'yearly': return 'Yearly'
      default: return interval
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RefreshCw className="text-indigo-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Recurring Invoices</h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-all"
        >
          <Plus size={18} />
          <span>New Recurring</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
        <div className="flex items-start gap-3">
          <Clock className="text-indigo-600 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-indigo-900">
              Automate your billing
            </p>
            <p className="text-sm text-indigo-700 mt-1">
              Recurring invoices are automatically generated on schedule. 
              Create once, get paid repeatedly.
            </p>
          </div>
        </div>
      </div>

      {/* Recurring List */}
      {recurring.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-[32px]">
          <RefreshCw className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No recurring invoices</h3>
          <p className="text-gray-500 mb-4">
            Set up recurring invoices to automate your billing
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700"
          >
            <Plus size={18} />
            <span>Create First Recurring Invoice</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {recurring.map((invoice) => (
            <div
              key={invoice.id}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-gray-900">{invoice.number}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                      <RefreshCw size={12} />
                      {getIntervalLabel(invoice.recurringInterval)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{invoice.client.name}</span>
                    <span>•</span>
                    <span className="font-medium text-gray-900">{formatCurrency(invoice.total)}</span>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar size={14} />
                      <span>Next: {formatDate(invoice.nextInvoiceDate)}</span>
                    </div>
                    {invoice.recurringEndDate && (
                      <div className="text-gray-400">
                        Until: {formatDate(invoice.recurringEndDate)}
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    {invoice.items.slice(0, 2).map((item, i) => (
                      <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {item.description.substring(0, 20)}...
                      </span>
                    ))}
                    {invoice.items.length > 2 && (
                      <span className="text-xs text-gray-400">+{invoice.items.length - 2} more</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteRecurring(invoice.id)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Form Modal */}
      {showForm && (
        <RecurringFormModal
          clients={clients}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            fetchRecurring()
          }}
        />
      )}
    </div>
  )
}

function RecurringFormModal({ 
  clients, 
  onClose, 
  onSuccess 
}: { 
  clients: Array<{ id: string; name: string }>
  onClose: () => void
  onSuccess: () => void 
}) {
  const [clientId, setClientId] = useState('')
  const [interval, setInterval] = useState('monthly')
  const [day, setDay] = useState(1)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId) {
      alert('Please select a client')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, interval, day })
      })

      if (res.ok) {
        onSuccess()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to create recurring invoice')
      }
    } catch (err) {
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold text-gray-900 mb-6">New Recurring Invoice</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select client</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {interval !== 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day of Month</label>
              <input
                type="number"
                min={1}
                max={28}
                value={day}
                onChange={(e) => setDay(parseInt(e.target.value))}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-3 font-bold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}