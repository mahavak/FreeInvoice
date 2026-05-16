/**
 * Invoice Templates System
 * Supports multiple languages and locales
 */

export type InvoiceTemplate = 'en-default' | 'nl-default' | 'en-minimal' | 'nl-formal';

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  notes?: string;
  paymentTerms?: string;
}

export interface ClientData {
  name: string;
  email: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  vatNumber?: string; // BTW nummer for Dutch
}

export interface SenderData {
  name: string;
  email?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  vatNumber?: string;
  iban?: string;
  bic?: string;
  bankName?: string;
}

export interface TemplateConfig {
  id: InvoiceTemplate;
  name: string;
  language: 'en' | 'nl';
  locale: string;
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  labels: {
    invoice: string;
    invoiceNumber: string;
    date: string;
    dueDate: string;
    description: string;
    quantity: string;
    unitPrice: string;
    total: string;
    subtotal: string;
    tax: string;
    grandTotal: string;
    paymentTerms: string;
    notes: string;
    thankYou: string;
    bankDetails: string;
    vatNumber: string;
    to: string;
    from: string;
  };
  paymentInstructions: string[];
}

// English Default Template
export const EN_DEFAULT: TemplateConfig = {
  id: 'en-default',
  name: 'English Standard',
  language: 'en',
  locale: 'en-US',
  currency: 'USD',
  currencySymbol: '$',
  dateFormat: 'MM/DD/YYYY',
  labels: {
    invoice: 'INVOICE',
    invoiceNumber: 'Invoice Number',
    date: 'Date',
    dueDate: 'Due Date',
    description: 'Description',
    quantity: 'Qty',
    unitPrice: 'Rate',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'Tax',
    grandTotal: 'Grand Total',
    paymentTerms: 'Payment Terms',
    notes: 'Notes',
    thankYou: 'Thank you for your business!',
    bankDetails: 'Bank Details',
    vatNumber: 'VAT Number',
    to: 'Bill To',
    from: 'From',
  },
  paymentInstructions: [
    'Please process payment within 14 days of receipt.',
    'Bank transfer details are provided below.',
    'Reference the invoice number in your payment.',
  ],
};

// Dutch Default Template (BTW compliant)
export const NL_DEFAULT: TemplateConfig = {
  id: 'nl-default',
  name: 'Nederlands Standaard',
  language: 'nl',
  locale: 'nl-NL',
  currency: 'EUR',
  currencySymbol: '€',
  dateFormat: 'DD-MM-YYYY',
  labels: {
    invoice: 'FACTUUR',
    invoiceNumber: 'Factuurnummer',
    date: 'Factuurdatum',
    dueDate: 'Vervaldatum',
    description: 'Omschrijving',
    quantity: 'Aantal',
    unitPrice: 'Tarief',
    total: 'Totaal',
    subtotal: 'Subtotaal',
    tax: 'BTW',
    grandTotal: 'Totaalbedrag',
    paymentTerms: 'Betalingscondities',
    notes: 'Opmerkingen',
    thankYou: 'Bedankt voor uw vertrouwen!',
    bankDetails: 'Bankgegevens',
    vatNumber: 'BTW-nummer',
    to: 'Factureren aan',
    from: 'Van',
  },
  paymentInstructions: [
    'Gelieve het bedrag binnen 14 dagen over te maken.',
    'Vermeld het factuurnummer bij uw betaling.',
    'Zie onderstaande bankgegevens.',
  ],
};

// English Minimal Template
export const EN_MINIMAL: TemplateConfig = {
  ...EN_DEFAULT,
  id: 'en-minimal',
  name: 'English Minimal',
  paymentInstructions: ['Payment due within 14 days.'],
};

// Dutch Formal Template (for official documents)
export const NL_FORMAL: TemplateConfig = {
  ...NL_DEFAULT,
  id: 'nl-formal',
  name: 'Nederlands Formeel',
  labels: {
    ...NL_DEFAULT.labels,
    invoice: 'FACTUUR / INVOICE',
    thankYou: 'Wij danken u voor het in ons gestelde vertrouwen.',
  },
  paymentInstructions: [
    'Gelieve het verschuldigde bedrag binnen 14 dagen na factuurdatum te voldoen op onderstaande rekening.',
    'Bij niet-tijdige betaling zijn wij gerechtigd de wettelijke rente en incassokosten in rekening te brengen.',
  ],
};

// Template registry
export const TEMPLATES: Record<InvoiceTemplate, TemplateConfig> = {
  'en-default': EN_DEFAULT,
  'nl-default': NL_DEFAULT,
  'en-minimal': EN_MINIMAL,
  'nl-formal': NL_FORMAL,
};

// Get template by ID
export function getTemplate(templateId: InvoiceTemplate): TemplateConfig {
  return TEMPLATES[templateId] || EN_DEFAULT;
}

// Get template by language
export function getTemplateByLanguage(language: 'en' | 'nl'): TemplateConfig {
  return language === 'nl' ? NL_DEFAULT : EN_DEFAULT;
}

// Format currency based on template
export function formatCurrency(amount: number, template: TemplateConfig): string {
  const formatter = new Intl.NumberFormat(template.locale, {
    style: 'currency',
    currency: template.currency,
  });
  return formatter.format(amount);
}

// Format date based on template
export function formatDate(date: Date | string, template: TemplateConfig): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const formatter = new Intl.DateTimeFormat(template.locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(d);
}

// Generate Dutch payment reference (rembours)
export function generatePaymentReference(invoiceNumber: string): string {
  // Dutch payment reference format: RF + check digits + invoice number
  const cleanNumber = invoiceNumber.replace(/\D/g, '').padStart(12, '0');
  const checkDigits = '98'; // Simplified - in production, calculate proper checksum
  return `RF${checkDigits}${cleanNumber}`;
}

// Calculate Dutch BTW (VAT)
export function calculateBTW(subtotal: number, rate: number = 21): {
  taxAmount: number;
  total: number;
} {
  const taxAmount = subtotal * (rate / 100);
  return {
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: subtotal + taxAmount,
  };
}
