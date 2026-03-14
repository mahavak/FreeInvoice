'use client'
import React, { useState, useEffect } from 'react'
import { Sparkles, Trash2, Plus, Loader2, DollarSign, Clock, FileText, Download } from 'lucide-react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { InvoicePDF } from './InvoicePDF'

/**
 * SmartInvoiceCreator: FreeInvoice Phase 4 Implementation
 * Features: AI Generation + PDF Export + Client-side Hydration.
 */
export default function SmartInvoiceCreator() {
  const [items, setItems] = useState<Item[]>([{ description: '', quantity: 1, price: 0 }])
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Avoid SSR mismatch with @react-pdf/renderer
  useEffect(() => {
    setIsClient(true)
  }, [])

  const addItem = () => setItems([...items, { description: '', quantity: 1, price: 0 }])
  
  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof Item, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  /**
   * AI Generation Workflow:
   * 1. User inputs project description.
   * 2. Bridge API connects to local 3090 Ti (Qwen-32B).
   * 3. AI returns structured JSON line items.
   */
  const handleMagicGenerate = async () => {
    if (!prompt) return
    setLoading(true)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      
      if (!res.ok) throw new Error('AI Bridge Error');
      
      const data = await res.json()
      if (data.items && Array.isArray(data.items)) {
        setItems(data.items)
      } else if (data.items && data.items.items) { // Handle potential nested JSON
        setItems(data.items.items)
      }
    } catch (err) {
      console.error("[SMART_CREATOR_ERROR]:", err)
      alert("Local AI Server is offline. Please ensure start-llm-server.sh is running on the host.")
    } finally {
      setLoading(false)
    }
  }

  const subtotal = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.price)), 0)

  return (
    <div className="space-y-12 rounded-[40px] border border-gray-100 bg-white p-12 shadow-2xl shadow-indigo-50/50">
      
      {/* AI Assistant Section */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-full bg-white/20 p-2 backdrop-blur-md">
              <Sparkles size={20} className="text-indigo-200" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-100">AI Smart Assistant</h3>
          </div>
          <h2 className="mb-6 text-2xl font-black">Generate your items in seconds</h2>
          <div className="flex flex-col gap-4 sm:flex-row">
            <input 
              type="text" 
              placeholder="e.g., 'Fullstack Next.js dashboard with Auth and Stripe integration'"
              className="flex-1 rounded-2xl border-none bg-white/10 px-6 py-4 text-sm text-white placeholder:text-indigo-200/50 focus:ring-2 focus:ring-white/50 backdrop-blur-sm transition-all"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleMagicGenerate()}
            />
            <button 
              onClick={handleMagicGenerate}
              disabled={loading || !prompt}
              className="flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-black text-indigo-900 transition-all hover:bg-indigo-50 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              <span>{loading ? 'Consulting 3090 Ti...' : 'Magic Generate'}</span>
            </button>
          </div>
        </div>
        {/* Decorative Blur */}
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Editor Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h3 className="text-xl font-black text-gray-900">Line Items</h3>
          <button 
            onClick={addItem}
            className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-indigo-600 transition-all hover:bg-indigo-50"
          >
            <Plus size={14} />
            <span>Add Item</span>
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="group relative grid grid-cols-12 gap-4 rounded-3xl border border-transparent bg-gray-50/50 p-2 transition-all hover:border-gray-200 hover:bg-white hover:shadow-lg hover:shadow-gray-100">
              <div className="col-span-12 lg:col-span-6">
                <div className="flex items-center gap-3 px-4 py-1">
                  <FileText size={18} className="text-gray-300" />
                  <input 
                    className="w-full border-none bg-transparent p-3 text-sm font-bold text-gray-900 focus:ring-0"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Describe the task or service..."
                  />
                </div>
              </div>
              <div className="col-span-5 lg:col-span-2">
                <div className="flex items-center gap-2 px-4 py-1">
                  <Clock size={16} className="text-gray-300" />
                  <input 
                    type="number"
                    className="w-full border-none bg-transparent p-3 text-sm font-bold text-gray-900 focus:ring-0"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  />
                </div>
              </div>
              <div className="col-span-5 lg:col-span-3">
                <div className="flex items-center gap-2 px-4 py-1">
                  <DollarSign size={16} className="text-gray-300" />
                  <input 
                    type="number"
                    className="w-full border-none bg-transparent p-3 text-sm font-bold text-gray-900 focus:ring-0"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', e.target.value)}
                  />
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-center lg:col-span-1">
                <button 
                  onClick={() => removeItem(index)}
                  className="rounded-xl p-3 text-gray-300 transition-all hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Calculation */}
      <div className="flex flex-col items-center justify-between gap-8 border-t border-gray-100 pt-12 lg:flex-row">
        <div className="text-center lg:text-left">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Total Savings</p>
          <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
            <Sparkles size={14} />
            Generated with local GPU (Saved $0.05 API cost)
          </p>
        </div>
        <div className="flex flex-col items-center lg:items-end gap-1">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Grand Total (USD)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tight text-gray-900">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        {isClient ? (
          <PDFDownloadLink 
            document={<InvoicePDF items={items} invoiceNumber={`INV-${Math.floor(Math.random() * 1000)}`} />} 
            fileName={`invoice-${Date.now()}.pdf`}
            className="flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-12 py-5 text-lg font-black text-white shadow-2xl shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-95"
          >
            {({ loading: pdfLoading }) => (
              <>
                {pdfLoading ? <Loader2 className="animate-spin" size={24} /> : <Download size={24} />}
                <span>{pdfLoading ? 'Structuring PDF...' : 'Download PDF Invoice'}</span>
              </>
            )}
          </PDFDownloadLink>
        ) : (
          <button className="rounded-2xl bg-gray-200 px-12 py-5 text-lg font-black text-gray-400 cursor-not-allowed">
            Initializing PDF...
          </button>
        )}
      </div>
    </div>
  )
}
