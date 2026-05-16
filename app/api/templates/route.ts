import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/templates
 * List all templates available to the user
 * - System default templates (isDefault: true)
 * - User's custom templates
 * - Public templates from Agency users (if Pro/Agency)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Get user's subscription tier for premium template access
    let userTier = 'free'
    let userId: string | null = null
    
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, subscriptionType: true }
      })
      if (user) {
        userId = user.id
        userTier = user.subscriptionType
      }
    }

    // Build query based on tier
    const where: any = {
      OR: [
        { isDefault: true }, // System defaults
      ]
    }

    // Add user's own templates if logged in
    if (userId) {
      where.OR.push({ userId })
    }

    // Add premium templates for Pro/Agency users
    if (userTier === 'pro' || userTier === 'agency') {
      where.OR.push({ isPremium: true })
    }

    // Add public templates for Agency users
    if (userTier === 'agency') {
      where.OR.push({ isPublic: true })
    }

    const templates = await prisma.invoiceTemplate.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    })

    // Parse labels JSON for each template
    const parsedTemplates = templates.map(t => ({
      ...t,
      labels: JSON.parse(t.labels),
      margins: JSON.parse(t.margins)
    }))

    return NextResponse.json({ templates: parsedTemplates })
  } catch (error: any) {
    console.error('[TEMPLATES_GET_ERROR]:', error.message)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

/**
 * POST /api/templates
 * Create a new custom template
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, subscriptionType: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const data = await req.json()

    // Validate required fields
    if (!data.name || !data.labels) {
      return NextResponse.json({ error: 'Name and labels are required' }, { status: 400 })
    }

    // Check premium feature limits
    const isPremium = user.subscriptionType === 'pro' || user.subscriptionType === 'agency'
    
    // Create template
    const template = await prisma.invoiceTemplate.create({
      data: {
        userId: user.id,
        name: data.name,
        description: data.description || null,
        language: data.language || 'en',
        currency: data.currency || 'USD',
        currencySymbol: data.currencySymbol || '$',
        currencyPosition: data.currencyPosition || 'before',
        isDefault: false,
        isPublic: isPremium && data.isPublic || false,
        isPremium: isPremium && data.isPremium || false,
        labels: typeof data.labels === 'string' ? data.labels : JSON.stringify(data.labels),
        primaryColor: data.primaryColor || '#4f46e5',
        secondaryColor: data.secondaryColor || '#1f2937',
        accentColor: data.accentColor || '#10b981',
        fontFamily: data.fontFamily || 'Helvetica',
        borderRadius: data.borderRadius || '16px',
        showLogo: data.showLogo ?? true,
        showPaymentInfo: data.showPaymentInfo ?? true,
        showNotes: data.showNotes ?? true,
        showTerms: data.showTerms ?? true,
        showImpactBadge: data.showImpactBadge ?? true,
        senderName: data.senderName || null,
        senderEmail: data.senderEmail || null,
        senderPhone: data.senderPhone || null,
        senderWebsite: data.senderWebsite || null,
        senderAddress: data.senderAddress || null,
        senderVatNumber: data.senderVatNumber || null,
        senderBankName: data.senderBankName || null,
        senderIban: data.senderIban || null,
        senderBic: data.senderBic || null,
        paymentTerms: data.paymentTerms || 'Net 30',
        paymentInstructions: data.paymentInstructions || null,
        footerText: data.footerText || null,
        showSocialImpact: data.showSocialImpact ?? true,
        pageSize: data.pageSize || 'A4',
        orientation: data.orientation || 'portrait',
        margins: typeof data.margins === 'string' ? data.margins : JSON.stringify(data.margins || { top: 60, right: 60, bottom: 60, left: 60 }),
      }
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error: any) {
    console.error('[TEMPLATES_CREATE_ERROR]:', error.message)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}