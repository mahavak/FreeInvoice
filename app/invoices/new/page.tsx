import SmartInvoiceCreator from "@/components/SmartInvoiceCreator"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

/**
 * New Invoice Page: FreeInvoice
 * Features: AI-Powered Creator integration, Auth Guard, Polished Layout.
 */
export default async function NewInvoicePage() {
  const session = await getServerSession(authOptions)
  
  // Auth Guard
  if (!session) redirect("/api/auth/signin")

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-16">
      <div className="mx-auto max-w-5xl">
        
        {/* Navigation Breadcrumb */}
        <nav className="mb-10">
          <Link 
            href="/dashboard" 
            className="group inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400 transition-colors hover:text-indigo-600"
          >
            <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            <span>Back to Dashboard</span>
          </Link>
        </nav>

        {/* Page Header */}
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-4 shadow-sm border border-indigo-100">
            <span>Phase 3: AI Generation</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-gray-900 mb-3">Draft Invoice</h1>
          <p className="text-xl font-medium text-gray-500 max-w-2xl">
            Leverage the power of your 3090 Ti to generate professional, accurate line items based on your project description.
          </p>
        </header>
        
        {/* Main AI Creator Component */}
        <SmartInvoiceCreator />

        {/* Footer Support */}
        <footer className="mt-16 text-center">
          <p className="text-sm font-medium text-gray-400">
            Need help? Check out the <Link href="/docs" className="text-indigo-600 hover:underline">Documentation</Link> or contact support.
          </p>
        </footer>
      </div>
    </div>
  )
}
