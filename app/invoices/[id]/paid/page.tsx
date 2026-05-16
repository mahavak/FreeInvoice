'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function InvoicePaidPage() {
  const { id } = useParams()
  const [status, setStatus] = useState('verifying')

  useEffect(() => {
    if (!id) return
    fetch(`/api/invoices/${id}/status`)
      .then(r => r.json())
      .then(data => {
        if (data.invoice?.status === 'paid') {
          setStatus('paid')
        } else {
          setStatus('pending')
        }
      })
      .catch(() => setStatus('error'))
  }, [id])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-lg p-8">
        {status === 'paid' ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment received!</h1>
            <p className="text-slate-600 mb-6">Thank you. The freelancer has been notified.</p>
          </>
        ) : status === 'pending' ? (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Processing payment...</h1>
            <p className="text-slate-600 mb-6">Please wait while we confirm your payment. This usually takes a few seconds.</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-slate-600 mb-6">We could not verify the payment status. Contact support if you were charged.</p>
          </>
        )}
        <a
          href={`/invoices/${id}`}
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          View invoice
        </a>
      </div>
    </div>
  )
}
