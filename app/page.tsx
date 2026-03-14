import Link from 'next/link'
import { Sparkles, Globe, Zap, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react'

/**
 * FreeInvoice Landing Page
 * Author: Senior AI Engineering Collaborator
 * Features: High-impact typography, Tailwind CSS design, Social Impact Messaging.
 */
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-8 lg:px-12">
        <div className="flex items-center gap-2 text-2xl font-black tracking-tighter text-indigo-600">
          <Sparkles className="fill-current" />
          <span>FreeInvoice</span>
        </div>
        <div className="hidden items-center gap-8 sm:flex">
          <Link href="#features" className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest">Features</Link>
          <Link href="#mission" className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest">Our Mission</Link>
          <Link href="/api/auth/signin" className="text-sm font-bold text-gray-900 hover:text-indigo-600 transition-colors uppercase tracking-widest border-l border-gray-200 pl-8">Log In</Link>
        </div>
        <Link href="/dashboard" className="rounded-full bg-indigo-600 px-8 py-3 text-sm font-black text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95">
          Get Started
        </Link>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-20 lg:px-12 lg:py-40">
          <div className="mx-auto max-w-6xl text-center">
            <div className="mb-10 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-indigo-600 ring-1 ring-indigo-100 shadow-sm">
              <Sparkles size={14} />
              <span>The World's First 1-for-3 Invoicing App</span>
            </div>
            <h1 className="mb-8 text-6xl font-black tracking-tight text-gray-900 lg:text-9xl leading-[0.9]">
              Invoicing <br />
              <span className="text-indigo-600 italic">Redefined.</span>
            </h1>
            <p className="mx-auto mb-14 max-w-2xl text-xl font-medium leading-relaxed text-gray-500">
              Describe your work in plain English. Our local AI node (powered by NVIDIA 3090 Ti) generates professional, accurate invoices instantly. No templates, no friction.
            </p>
            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
              <Link href="/dashboard" className="group flex items-center gap-3 rounded-2xl bg-indigo-600 px-12 py-6 text-xl font-black text-white shadow-2xl shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95">
                <span>Start for Free</span>
                <ArrowRight size={24} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span>3 Free Invoices / mo</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="bg-gray-50 px-6 py-32 lg:px-12">
          <div className="mx-auto max-w-7xl text-center mb-20">
            <h2 className="text-4xl font-black tracking-tight text-gray-900">Why FreeInvoice?</h2>
          </div>
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
              <FeatureCard 
                icon={<Zap size={32} className="text-amber-500" />}
                title="AI-Powered Speed"
                description="Stop wasting 20 minutes on formatting. Describe your work and get a structured, professional PDF in 30 seconds."
              />
              <FeatureCard 
                icon={<ShieldCheck size={32} className="text-emerald-500" />}
                title="Privacy First"
                description="We use private local LLMs. Your project data stays off the big tech grids, ensuring maximum confidentiality."
              />
              <FeatureCard 
                icon={<Globe size={32} className="text-indigo-500" />}
                title="Global Impact"
                description="Your Pro subscription funds 3 free accounts for freelancers in developing countries. Leveling the global field."
              />
            </div>
          </div>
        </section>

        {/* Mission CTA */}
        <section id="mission" className="px-6 py-32 lg:px-12 overflow-hidden relative">
          <div className="mx-auto max-w-5xl rounded-[48px] bg-indigo-900 p-12 lg:p-24 text-center text-white shadow-2xl relative z-10">
            <h2 className="mb-8 text-4xl lg:text-6xl font-black tracking-tight leading-tight">
              A mission to support <br />
              <span className="text-indigo-300 italic">global creators.</span>
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-xl font-medium text-indigo-100 opacity-80">
              We believe professional tools shouldn't be a barrier. Join us in building a more equitable freelance economy while streamlining your own business.
            </p>
            <Link href="/dashboard" className="inline-flex rounded-2xl bg-white px-12 py-5 text-lg font-black text-indigo-900 shadow-xl transition-all hover:bg-indigo-50 active:scale-95">
              Join the Movement
            </Link>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-50/50 rounded-full blur-3xl -z-0" />
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-gray-100 px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-8 sm:flex-row">
          <div className="flex items-center gap-2 text-xl font-black tracking-tighter text-indigo-600">
            <span>FreeInvoice</span>
          </div>
          <div className="flex gap-10 text-xs font-black uppercase tracking-widest text-gray-400">
            <a href="#" className="hover:text-indigo-600">Privacy</a>
            <a href="#" className="hover:text-indigo-600">Terms</a>
            <a href="#" className="hover:text-indigo-600">Contact</a>
          </div>
          <p className="text-xs font-bold text-gray-300">© 2026 FreeInvoice. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="group rounded-[40px] border border-gray-100 bg-white p-12 shadow-sm transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-50/50">
      <div className="mb-8 inline-flex rounded-[24px] bg-indigo-50/50 p-6 transition-all group-hover:bg-indigo-600 group-hover:text-white">
        {icon}
      </div>
      <h3 className="mb-4 text-2xl font-black text-gray-900">{title}</h3>
      <p className="text-lg font-medium leading-relaxed text-gray-500">{description}</p>
    </div>
  )
}
