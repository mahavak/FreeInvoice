import Stripe from 'stripe'

/**
 * Stripe Configuration for FreeInvoice
 * Tiered pricing with 1-for-3 social impact model
 */

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
})

// Subscription tiers with Stripe Price IDs
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    currency: 'eur',
    invoicesPerMonth: 3,
    features: ['3 facturen/maand', 'AI-aangedreven generatie', 'PDF-download', 'Nederlandse & Engelse sjablonen', 'BTW & IBAN automatisch'],
    stripePriceId: null, // Free tier has no Stripe price
  },
  pro: {
    name: 'Pro',
    price: 9,
    currency: 'eur',
    invoicesPerMonth: 50,
    features: [
      '50 facturen/maand',
      'Alle Free-functies',
      'Klantbeheer',
      'Factuurhistorie',
      'E-mail levering',
      'Prioriteitsondersteuning',
      '1-for-3 Sociale Impact'
    ],
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
  },
  agency: {
    name: 'Agency',
    price: 29,
    currency: 'eur',
    invoicesPerMonth: -1, // Unlimited
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
    stripePriceId: process.env.STRIPE_AGENCY_PRICE_ID || 'price_agency_monthly',
  },
} as const

export type TierKey = keyof typeof SUBSCRIPTION_TIERS

/**
 * Get tier limits for a user
 */
export function getTierLimits(subscriptionType: string) {
  const tier = SUBSCRIPTION_TIERS[subscriptionType as TierKey] || SUBSCRIPTION_TIERS.free
  return {
    maxInvoices: tier.invoicesPerMonth,
    tierName: tier.name,
  }
}

/**
 * Check if user can create an invoice
 */
export function canCreateInvoice(
  invoicesThisMonth: number,
  subscriptionType: string
): { allowed: boolean; remaining: number } {
  const { maxInvoices } = getTierLimits(subscriptionType)
  
  if (maxInvoices === -1) {
    return { allowed: true, remaining: -1 } // Unlimited
  }
  
  const remaining = maxInvoices - invoicesThisMonth
  return {
    allowed: remaining> 0,
    remaining: Math.max(0, remaining),
  }
}