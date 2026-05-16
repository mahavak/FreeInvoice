import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/templates/[id]
 * Get a specific template
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    const template = await prisma.invoiceTemplate.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Check access permissions
    const session = await getServerSession(authOptions)
    const user = session?.user?.email 
      ? await prisma.user.findUnique({ where: { email: session.user.email } })
      : null

    // Allow access if:
    // - Template is default
    // - Template belongs to user
    // - Template is public/premium and user has Pro/Agency
    if (!template.isDefault && template.userId !== user?.id) {
      if (!template.isPublic && !template.isPremium) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 })
      }
      if (template.isPremium && user?.subscriptionType === 'free') {
        return NextResponse.json({ error: 'Premium template requires Pro subscription' }, { status: 403 })
      }
    }

    return NextResponse.json({ 
      template: {
        ...template,
        labels: JSON.parse(template.labels),
        margins: JSON.parse(template.margins)
      }
    })
  } catch (error: any) {
    console.error('[TEMPLATE_GET_ERROR]:', error.message)
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 })
  }
}

/**
 * PUT /api/templates/[id]
 * Update a template
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const data = await req.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify ownership
    const existing = await prisma.invoiceTemplate.findFirst({
      where: { id, userId: user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Template not found or not owned' }, { status: 404 })
    }

    // Build update data
    const updateData: any = {}
    
    if (data.name) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.language) updateData.language = data.language
    if (data.currency) updateData.currency = data.currency
    if (data.currencySymbol) updateData.currencySymbol = data.currencySymbol
    if (data.currencyPosition) updateData.currencyPosition = data.currencyPosition
    if (data.labels) updateData.labels = typeof data.labels === 'string' ? data.labels : JSON.stringify(data.labels)
    if (data.primaryColor) updateData.primaryColor = data.primaryColor
    if (data.secondaryColor) updateData.secondaryColor = data.secondaryColor
    if (data.accentColor) updateData.accentColor = data.accentColor
    if (data.fontFamily) updateData.fontFamily = data.fontFamily
    if (data.borderRadius) updateData.borderRadius = data.borderRadius
    if (data.showLogo !== undefined) updateData.showLogo = data.showLogo
    if (data.showPaymentInfo !== undefined) updateData.showPaymentInfo = data.showPaymentInfo
    if (data.showNotes !== undefined) updateData.showNotes = data.showNotes
    if (data.showTerms !== undefined) updateData.showTerms = data.showTerms
    if (data.showImpactBadge !== undefined) updateData.showImpactBadge = data.showImpactBadge
    if (data.senderName !== undefined) updateData.senderName = data.senderName
    if (data.senderEmail !== undefined) updateData.senderEmail = data.senderEmail
    if (data.senderPhone !== undefined) updateData.senderPhone = data.senderPhone
    if (data.senderWebsite !== undefined) updateData.senderWebsite = data.senderWebsite
    if (data.senderAddress !== undefined) updateData.senderAddress = data.senderAddress
    if (data.senderVatNumber !== undefined) updateData.senderVatNumber = data.senderVatNumber
    if (data.senderBankName !== undefined) updateData.senderBankName = data.senderBankName
    if (data.senderIban !== undefined) updateData.senderIban = data.senderIban
    if (data.senderBic !== undefined) updateData.senderBic = data.senderBic
    if (data.paymentTerms) updateData.paymentTerms = data.paymentTerms
    if (data.paymentInstructions !== undefined) updateData.paymentInstructions = data.paymentInstructions
    if (data.footerText !== undefined) updateData.footerText = data.footerText
    if (data.showSocialImpact !== undefined) updateData.showSocialImpact = data.showSocialImpact
    if (data.pageSize) updateData.pageSize = data.pageSize
    if (data.orientation) updateData.orientation = data.orientation
    if (data.margins) updateData.margins = typeof data.margins === 'string' ? data.margins : JSON.stringify(data.margins)

    const template = await prisma.invoiceTemplate.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ 
      template: {
        ...template,
        labels: JSON.parse(template.labels),
        margins: JSON.parse(template.margins)
      }
    })
  } catch (error: any) {
    console.error('[TEMPLATE_UPDATE_ERROR]:', error.message)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }
}

/**
 * DELETE /api/templates/[id]
 * Delete a template
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify ownership and not default
    const existing = await prisma.invoiceTemplate.findFirst({
      where: { id, userId: user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Template not found or not owned' }, { status: 404 })
    }

    if (existing.isDefault) {
      return NextResponse.json({ error: 'Cannot delete default templates' }, { status: 400 })
    }

    await prisma.invoiceTemplate.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[TEMPLATE_DELETE_ERROR]:', error.message)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}

/**
 * POST /api/templates/[id]/duplicate
 * Duplicate a template
 */
export async function POST_DUPLICATE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get original template
    const original = await prisma.invoiceTemplate.findUnique({ where: { id } })

    if (!original) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Create duplicate
    const duplicate = await prisma.invoiceTemplate.create({
      data: {
        userId: user.id,
        name: `${original.name} (Copy)`,
        description: original.description,
        language: original.language,
        currency: original.currency,
        currencySymbol: original.currencySymbol,
        currencyPosition: original.currencyPosition,
        isDefault: false,
        isPublic: false,
        isPremium: false,
        labels: original.labels,
        primaryColor: original.primaryColor,
        secondaryColor: original.secondaryColor,
        accentColor: original.accentColor,
        fontFamily: original.fontFamily,
        borderRadius: original.borderRadius,
        showLogo: original.showLogo,
        showPaymentInfo: original.showPaymentInfo,
        showNotes: original.showNotes,
        showTerms: original.showTerms,
        showImpactBadge: original.showImpactBadge,
        senderName: original.senderName,
        senderEmail: original.senderEmail,
        senderPhone: original.senderPhone,
        senderWebsite: original.senderWebsite,
        senderAddress: original.senderAddress,
        senderVatNumber: original.senderVatNumber,
        senderBankName: original.senderBankName,
        senderIban: original.senderIban,
        senderBic: original.senderBic,
        paymentTerms: original.paymentTerms,
        paymentInstructions: original.paymentInstructions,
        footerText: original.footerText,
        showSocialImpact: original.showSocialImpact,
        pageSize: original.pageSize,
        orientation: original.orientation,
        margins: original.margins,
      }
    })

    return NextResponse.json({ 
      template: {
        ...duplicate,
        labels: JSON.parse(duplicate.labels),
        margins: JSON.parse(duplicate.margins)
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('[TEMPLATE_DUPLICATE_ERROR]:', error.message)
    return NextResponse.json({ error: 'Failed to duplicate template' }, { status: 500 })
  }
}