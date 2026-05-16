import { NextResponse } from 'next/server';
import { checkInvoiceUsage, incrementInvoiceUsage } from '@/lib/usage-tracking';
import { aiFallbackGenerate, type AIGenerateResult } from '@/lib/ai-fallback';

/**
 * AI Generation Bridge: FreeInvoice -> 3090 Ti (Local Qwen Server)
 * Author: Senior AI Engineering Collaborator
 * Purpose: Zero-cost AI inference for professional line-item generation.
 * 
 * Phase 3 Enhancement: AI Fallback System (Local Qwen -> OpenRouter)
 * - Tries local GPU first (zero cost)
 * - Falls back to OpenRouter cloud if GPU offline
 * - Tracks which provider was used for cost analysis
 */
export async function POST(req: Request) {
  // Check usage limits before proceeding
  const usageCheck = await checkInvoiceUsage();
  
  // If usageCheck is a NextResponse, it means unauthorized
  if (usageCheck instanceof NextResponse) {
    return usageCheck;
  }

  if (!usageCheck.allowed) {
    return NextResponse.json(
      { 
        error: 'Invoice limit reached',
        remaining: 0,
        tier: usageCheck.tierName,
        message: `You've used all your invoices for this month. Upgrade to Pro for 50 invoices/month.`
      },
      { status: 429 }
    );
  }

  const { prompt, language = 'en' } = await req.json();

  try {
    // Use AI fallback system (tries local first, then cloud)
    const result: AIGenerateResult = await aiFallbackGenerate(prompt, language);
    
    // Parse the AI's JSON output
    let items;
    if (result.items) {
      items = result.items;
    } else {
      const content = result.content;
      items = JSON.parse(content);
    }
    
    // Increment usage counter after successful generation
    await incrementInvoiceUsage(usageCheck.userId);
    
    return NextResponse.json({ 
      items,
      remaining: usageCheck.remaining - 1,
      tier: usageCheck.tierName,
      provider: result.provider,        // 'local' or 'openrouter'
      cost: result.cost,                // $0 for local, ~$0.001 for cloud
      fallback: result.fallback         // true if used fallback
    });

  } catch (error: any) {
    console.error("[AI_BRIDGE_ERROR]:", error.message);
    return NextResponse.json(
      { error: "AI generation failed. Both local and cloud providers are unavailable." },
      { status: 503 }
    );
  }
}
