import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/invoices/[id]/send
 * Send invoice via email
 * 
 * Supports multiple email providers:
 * - Resend (recommended for startups)
 * - SendGrid (enterprise)
 * - Postmark (transactional)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { provider = 'resend' } = await req.json().catch(() => ({}))

    // Get invoice with client info
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        user: { email: session.user.email }
      },
      include: {
        client: true,
        user: { select: { name: true, email: true } }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (!invoice.client?.email) {
      return NextResponse.json({ error: 'Client email not found' }, { status: 400 })
    }

    // Generate invoice HTML
    const invoiceHtml = generateInvoiceHtml(invoice)

    // Send email based on provider
    let emailResult
    
    switch (provider) {
      case 'resend':
        emailResult = await sendWithResend(invoice, invoiceHtml)
        break
      case 'sendgrid':
        emailResult = await sendWithSendGrid(invoice, invoiceHtml)
        break
      case 'postmark':
        emailResult = await sendWithPostmark(invoice, invoiceHtml)
        break
      default:
        return NextResponse.json({ error: 'Invalid email provider' }, { status: 400 })
    }

    // Update invoice status to 'sent'
    await prisma.invoice.update({
      where: { id },
      data: { status: 'sent' }
    })

    return NextResponse.json({
      success: true,
      message: `Invoice sent to ${invoice.client.email}`,
      emailId: emailResult.id
    })

  } catch (error: any) {
    console.error('[INVOICE_SEND_ERROR]:', error.message)
    return NextResponse.json(
      { error: 'Failed to send invoice' },
      { status: 500 }
    )
  }
}

/**
 * Generate HTML for invoice email
 */
function generateInvoiceHtml(invoice: any): string {
  const items = invoice.items as Array<{ description: string; quantity: number; price: number }>
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const taxAmount = subtotal * (invoice.taxRate / 100)
  const total = subtotal + taxAmount

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.number}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #4f46e5; font-size: 32px; margin: 0;">FreeInvoice</h1>
        <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">Freelancer Freedom</p>
      </div>
      
      <div style="background: #f9fafb; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px;">Invoice ${invoice.number}</h2>
        <div style="color: #4b5563; font-size: 14px; line-height: 1.6;">
          <p style="margin: 4px 0;"><strong>From:</strong> ${invoice.user.name || 'Your Business'}</p>
          <p style="margin: 4px 0;"><strong>To:</strong> ${invoice.client.name}</p>
          <p style="margin: 4px 0;"><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="border-bottom: 2px solid #e5e7eb;">
            <th style="text-align: left; padding: 12px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Description</th>
            <th style="text-align: right; padding: 12px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Qty</th>
            <th style="text-align: right; padding: 12px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Rate</th>
            <th style="text-align: right; padding: 12px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 12px 0; color: #111827;">${item.description}</td>
              <td style="text-align: right; padding: 12px 0; color: #6b7280;">${item.quantity}</td>
              <td style="text-align: right; padding: 12px 0; color: #6b7280;">$${item.price.toFixed(2)}</td>
              <td style="text-align: right; padding: 12px 0; color: #111827; font-weight: bold;">$${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="text-align: right; border-top: 2px solid #4f46e5; padding-top: 16px;">
        <p style="font-size: 32px; font-weight: bold; color: #111827; margin: 0;">$${total.toFixed(2)}</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">Total Amount Due</p>
      </div>

      <div style="text-align: center; margin-top: 40px;">
        <a href="${process.env.NEXTAUTH_URL}/api/invoices/${invoice.id}/payment-link" style="display:inline-block;padding:14px 28px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:16px;">💳 Pay Invoice Now</a>
        <p style="color:#6b7280;font-size:13px;margin-top:12px;">Click to generate a secure one-click payment link.</p>
      </div>

      <div style="text-align: center; margin-top: 40px; padding: 24px; background: #f0fdf4; border-radius: 16px;">
        <p style="color: #166534; font-size: 12px; font-weight: bold; margin: 0;">
          GENERATED WITH FREEINVOICE 1-FOR-3 SOCIAL IMPACT MODEL
        </p>
        <p style="color: #166534; font-size: 11px; margin-top: 8px;">
          Your partnership helps fund 3 free accounts for freelancers in developing countries.
        </p>
      </div>
    </body>
    </html>
  `
}

/**
 * Send with Resend (recommended)
 */
async function sendWithResend(invoice: any, html: string) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY

  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'FreeInvoice <noreply@freeinvoice.app>',
      to: invoice.client.email,
      subject: `Invoice ${invoice.number} from ${invoice.user.name || 'FreeInvoice'}`,
      html
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Resend API error')
  }

  const result = await response.json()
  return { id: result.id }
}

/**
 * Send with SendGrid
 */
async function sendWithSendGrid(invoice: any, html: string) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY

  if (!SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY not configured')
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: invoice.client.email, name: invoice.client.name }]
      }],
      from: { email: 'noreply@freeinvoice.app', name: 'FreeInvoice' },
      subject: `Invoice ${invoice.number} from ${invoice.user.name || 'FreeInvoice'}`,
      content: [{
        type: 'text/html',
        value: html
      }]
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.errors?.[0]?.message || 'SendGrid API error')
  }

  return { id: response.headers.get('x-message-id') }
}

/**
 * Send with Postmark
 */
async function sendWithPostmark(invoice: any, html: string) {
  const POSTMARK_SERVER_TOKEN = process.env.POSTMARK_SERVER_TOKEN

  if (!POSTMARK_SERVER_TOKEN) {
    throw new Error('POSTMARK_SERVER_TOKEN not configured')
  }

  const response = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      'X-Postmark-Server-Token': POSTMARK_SERVER_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      From: 'noreply@freeinvoice.app',
      To: invoice.client.email,
      Subject: `Invoice ${invoice.number} from ${invoice.user.name || 'FreeInvoice'}`,
      HtmlBody: html
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.Message || 'Postmark API error')
  }

  const result = await response.json()
  return { id: result.MessageID }
}