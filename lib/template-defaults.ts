import { prisma } from '@/lib/prisma'

/**
 * Default Invoice Templates
 * Professional templates for different use cases and languages
 */

export const DEFAULT_TEMPLATES = [
  {
    name: 'Professional Blue',
    description: 'Clean, professional design with indigo accents. Perfect for freelancers and small businesses.',
    language: 'en',
    currency: 'USD',
    currencySymbol: '$',
    currencyPosition: 'before',
    isDefault: true,
    labels: JSON.stringify({
      invoice: 'INVOICE',
      invoiceNumber: 'Invoice Number',
      date: 'Date Issued',
      dueDate: 'Due Date',
      billTo: 'Bill To',
      from: 'From',
      description: 'Description',
      quantity: 'Qty',
      unitPrice: 'Rate',
      total: 'Total',
      subtotal: 'Subtotal',
      tax: 'Tax',
      grandTotal: 'Grand Total',
      paymentTerms: 'Payment Terms',
      paymentInstructions: 'Please process payment within 14 days of receipt.',
      notes: 'Notes',
      thankYou: 'Thank you for your business!',
    }),
    primaryColor: '#4f46e5',
    secondaryColor: '#1f2937',
    accentColor: '#10b981',
    fontFamily: 'Helvetica',
    borderRadius: '16px',
    showLogo: true,
    showPaymentInfo: true,
    showNotes: true,
    showTerms: true,
    showImpactBadge: true,
    paymentTerms: 'Net 30',
    showSocialImpact: true,
    pageSize: 'A4',
    orientation: 'portrait',
    margins: JSON.stringify({ top: 60, right: 60, bottom: 60, left: 60 }),
  },
  {
    name: 'Minimalist',
    description: 'Clean, minimalist design. Focus on content over decoration.',
    language: 'en',
    currency: 'USD',
    currencySymbol: '$',
    currencyPosition: 'before',
    isDefault: true,
    labels: JSON.stringify({
      invoice: 'Invoice',
      invoiceNumber: 'No.',
      date: 'Date',
      dueDate: 'Due',
      billTo: 'Bill To',
      from: 'From',
      description: 'Description',
      quantity: 'Qty',
      unitPrice: 'Rate',
      total: 'Amount',
      subtotal: 'Subtotal',
      tax: 'Tax',
      grandTotal: 'Total',
      paymentTerms: 'Terms',
      paymentInstructions: 'Payment due within 14 days.',
      notes: '',
      thankYou: 'Thank you',
    }),
    primaryColor: '#000000',
    secondaryColor: '#374151',
    accentColor: '#6b7280',
    fontFamily: 'Helvetica',
    borderRadius: '4px',
    showLogo: false,
    showPaymentInfo: true,
    showNotes: false,
    showTerms: true,
    showImpactBadge: false,
    paymentTerms: 'Net 14',
    showSocialImpact: false,
    pageSize: 'A4',
    orientation: 'portrait',
    margins: JSON.stringify({ top: 40, right: 40, bottom: 40, left: 40 }),
  },
  {
    name: 'Nederlands Professioneel',
    description: 'Professionele factuur met Nederlandse labels. BTW-compliant.',
    language: 'nl',
    currency: 'EUR',
    currencySymbol: '€',
    currencyPosition: 'after',
    isDefault: true,
    labels: JSON.stringify({
      invoice: 'FACTUUR',
      invoiceNumber: 'Factuurnummer',
      date: 'Factuurdatum',
      dueDate: 'Vervaldatum',
      billTo: 'Factureren aan',
      from: 'Van',
      description: 'Omschrijving',
      quantity: 'Aantal',
      unitPrice: 'Tarief',
      total: 'Totaal',
      subtotal: 'Subtotaal',
      tax: 'BTW',
      grandTotal: 'Totaalbedrag',
      paymentTerms: 'Betalingsvoorwaarden',
      paymentInstructions: 'Gelieve betaling binnen 14 dagen over te maken op onderstaande rekening.',
      notes: 'Opmerkingen',
      thankYou: 'Bedankt voor uw vertrouwen!',
      bankDetails: 'Bankgegevens',
      vatNumber: 'BTW-nummer',
    }),
    primaryColor: '#4f46e5',
    secondaryColor: '#1f2937',
    accentColor: '#10b981',
    fontFamily: 'Helvetica',
    borderRadius: '16px',
    showLogo: true,
    showPaymentInfo: true,
    showNotes: true,
    showTerms: true,
    showImpactBadge: true,
    paymentTerms: 'Net 14',
    showSocialImpact: true,
    pageSize: 'A4',
    orientation: 'portrait',
    margins: JSON.stringify({ top: 60, right: 60, bottom: 60, left: 60 }),
  },
  {
    name: 'Modern Gradient',
    description: 'Bold, modern design with gradient header. Great for creative professionals.',
    language: 'en',
    currency: 'USD',
    currencySymbol: '$',
    currencyPosition: 'before',
    isDefault: false,
    isPremium: true,
    labels: JSON.stringify({
      invoice: 'INVOICE',
      invoiceNumber: 'Invoice #',
      date: 'Date',
      dueDate: 'Due',
      billTo: 'Client',
      from: 'From',
      description: 'Service',
      quantity: 'Hours',
      unitPrice: 'Rate',
      total: 'Amount',
      subtotal: 'Subtotal',
      tax: 'Tax',
      grandTotal: 'Total Due',
      paymentTerms: 'Terms',
      paymentInstructions: 'Payment due upon receipt.',
      notes: 'Notes',
      thankYou: 'Thanks!',
    }),
    primaryColor: '#8b5cf6',
    secondaryColor: '#1f2937',
    accentColor: '#f59e0b',
    fontFamily: 'Inter',
    borderRadius: '24px',
    showLogo: true,
    showPaymentInfo: true,
    showNotes: true,
    showTerms: true,
    showImpactBadge: true,
    paymentTerms: 'Due on receipt',
    showSocialImpact: true,
    pageSize: 'A4',
    orientation: 'portrait',
    margins: JSON.stringify({ top: 48, right: 48, bottom: 48, left: 48 }),
  },
  {
    name: 'Corporate Formal',
    description: 'Traditional, formal design for corporate clients. Dutch VAT compliant.',
    language: 'nl',
    currency: 'EUR',
    currencySymbol: '€',
    currencyPosition: 'after',
    isDefault: false,
    isPremium: true,
    labels: JSON.stringify({
      invoice: 'FACTUUR / INVOICE',
      invoiceNumber: 'Factuurnummer',
      date: 'Factuurdatum',
      dueDate: 'Vervaldatum',
      billTo: 'Geadresseerde',
      from: 'Afzender',
      description: 'Omschrijving',
      quantity: 'Aantal',
      unitPrice: 'Eenheidsprijs',
      total: 'Bedrag',
      subtotal: 'Subtotaal',
      tax: 'BTW',
      grandTotal: 'Totaal',
      paymentTerms: 'Betalingscondities',
      paymentInstructions: 'Gelieve het verschuldigde bedrag binnen 14 dagen na factuurdatum te voldoen.',
      notes: 'Opmerkingen',
      thankYou: 'Wij danken u voor het in ons gestelde vertrouwen.',
      bankDetails: 'Bankgegevens',
      vatNumber: 'BTW-nummer',
      chamberOfCommerce: 'Kamer van Koophandel',
    }),
    primaryColor: '#1e3a5f',
    secondaryColor: '#374151',
    accentColor: '#2563eb',
    fontFamily: 'Times New Roman',
    borderRadius: '4px',
    showLogo: true,
    showPaymentInfo: true,
    showNotes: true,
    showTerms: true,
    showImpactBadge: false,
    paymentTerms: 'Net 14',
    showSocialImpact: false,
    pageSize: 'A4',
    orientation: 'portrait',
    margins: JSON.stringify({ top: 72, right: 72, bottom: 72, left: 72 }),
  },
]

/**
 * Seed default templates into the database
 * Run this on first startup
 */
export async function seedDefaultTemplates() {
  let created = 0
  let existing = 0

  for (const template of DEFAULT_TEMPLATES) {
    // Check if template already exists
    const existingTemplate = await prisma.invoiceTemplate.findFirst({
      where: {
        name: template.name,
        isDefault: true,
      }
    })

    if (!existingTemplate) {
      await prisma.invoiceTemplate.create({ data: template as any })
      created++
    } else {
      existing++
    }
  }

  console.log(`[TEMPLATES] Seeded ${created} new templates, ${existing} already existed`)
  return { created, existing }
}

/**
 * Get template with parsed labels
 */
export async function getTemplate(templateId: string | null) {
  if (!templateId) {
    // Return default English template
    const defaultTemplate = await prisma.invoiceTemplate.findFirst({
      where: { isDefault: true, language: 'en' }
    })
    if (defaultTemplate) {
      return {
        ...defaultTemplate,
        labels: JSON.parse(defaultTemplate.labels),
        margins: JSON.parse(defaultTemplate.margins)
      }
    }
    return null
  }

  const template = await prisma.invoiceTemplate.findUnique({
    where: { id: templateId }
  })

  if (!template) return null

  return {
    ...template,
    labels: JSON.parse(template.labels),
    margins: JSON.parse(template.margins)
  }
}