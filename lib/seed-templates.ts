/**
 * Seed default templates on app startup
 * Run this once when the app starts
 */

import { prisma } from '@/lib/prisma'
import { DEFAULT_TEMPLATES } from '@/lib/template-defaults'

let seeded = false

export async function ensureTemplatesSeeded() {
  if (seeded) return
  
  try {
    // Check if any templates exist
    const count = await prisma.invoiceTemplate.count()
    
    if (count === 0) {
      console.log('[TEMPLATES] No templates found, seeding defaults...')
      
      for (const template of DEFAULT_TEMPLATES) {
        await prisma.invoiceTemplate.create({
          data: template as any
        })
      }
      
      console.log(`[TEMPLATES] Seeded ${DEFAULT_TEMPLATES.length} default templates`)
    }
    
    seeded = true
  } catch (error) {
    console.error('[TEMPLATES] Failed to seed templates:', error)
  }
}