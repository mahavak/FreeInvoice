/**
 * AI Fallback System for FreeInvoice
 * Phase 3 Enhancement
 * 
 * Priority chain:
 * 1. Local Qwen (RTX 3090 Ti) - Zero cost, best performance
 * 2. OpenRouter (DeepSeek/Qwen) - Low cost cloud backup
 * 3. OpenAI (GPT-4o-mini) - Reliable fallback
 * 
 * Features:
 * - Automatic health checks
 * - Cost tracking
 * - Graceful degradation
 */

interface AIProvider {
  name: string
  baseURL: string
  apiKey?: string
  model: string
  costPer1kTokens: number
  timeout: number
}

export interface AIGenerateResult {
  content: string
  items?: Array<{ description: string; quantity: number; price: number }>
  provider: string
  fallback: boolean
  cost: number
  responseTime: number
}

// Provider configurations
const PROVIDERS: Record<string, AIProvider> = {
  local: {
    name: 'Local Qwen',
    baseURL: process.env.AI_NODE_URL || 'http://localhost:8080',
    model: 'qwen',
    costPer1kTokens: 0,
    timeout: 30000,
  },
  openrouter: {
    name: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat',
    costPer1kTokens: 0.00014,
    timeout: 60000,
  },
  openai: {
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
    costPer1kTokens: 0.00015,
    timeout: 60000,
  },
}

// Health check cache
let healthCache: Record<string, { healthy: boolean; lastCheck: number }> = {}
const HEALTH_TTL = 60000 // 1 minute

/**
 * Check if a provider is healthy
 */
async function checkHealth(provider: AIProvider): Promise<boolean> {
  const now = Date.now()
  const cached = healthCache[provider.name]
  
  if (cached && now - cached.lastCheck < HEALTH_TTL) {
    return cached.healthy
  }
  
  // Local provider uses /health endpoint
  if (provider.name === 'Local Qwen') {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(`${provider.baseURL}/health`, {
        method: 'GET',
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      const healthy = response.ok
      healthCache[provider.name] = { healthy, lastCheck: now }
      return healthy
    } catch {
      healthCache[provider.name] = { healthy: false, lastCheck: now }
      return false
    }
  }
  
  // Cloud providers - assume healthy if API key configured
  const healthy = !!provider.apiKey
  healthCache[provider.name] = { healthy, lastCheck: now }
  return healthy
}

/**
 * Get system prompt for invoice generation
 */
function getSystemPrompt(language: 'en' | 'nl'): string {
  if (language === 'nl') {
    return `Je bent een professionele freelance consultant. Converteer de projectbeschrijving van de gebruiker naar een JSON-object met een "items" array. Elk item moet bevatten:
- description: string (duidelijke, professionele taakomschrijving)
- quantity: number (uren of eenheden, schat een redelijke waarde)
- price: number (uurtarief of stukprijs in EUR)

Voorbeeld output:
{"items": [{"description": "Website ontwikkeling", "quantity": 20, "price": 85}, {"description": "UI/UX Design", "quantity": 10, "price": 75}]}

Geef ALLEEN geldige JSON terug, geen uitleg.`
  }
  
  return `You are a professional freelance consultant. Convert the user's project description into a JSON object with an "items" array. Each item must have:
- description: string (clear, professional task description)
- quantity: number (hours or units, estimate reasonable value)
- price: number (hourly rate or unit price in USD)

Example output:
{"items": [{"description": "Initial UI/UX Design", "quantity": 10, "price": 75}, {"description": "Frontend Development", "quantity": 20, "price": 85}]}

Return ONLY valid JSON, no explanation.`
}

/**
 * Try to generate with a specific provider
 */
async function generateWithProvider(
  provider: AIProvider,
  prompt: string,
  language: 'en' | 'nl'
): Promise<{ content: string; responseTime: number }> {
  const startTime = Date.now()
  
  // Build request
  const body: any = {
    model: provider.model,
    messages: [
      { role: 'system', content: getSystemPrompt(language) },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  // Add auth headers based on provider
  if (provider.apiKey) {
    headers['Authorization'] = `Bearer ${provider.apiKey}`
  }
  
  // OpenRouter requires additional headers
  if (provider.name === 'OpenRouter') {
    headers['HTTP-Referer'] = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    headers['X-Title'] = 'FreeInvoice'
  }
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), provider.timeout)
  
  const response = await fetch(`${provider.baseURL}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: controller.signal,
  })
  
  clearTimeout(timeoutId)
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`${provider.name} API error: ${response.status} - ${error}`)
  }
  
  const data = await response.json()
  const content = data.choices[0]?.message?.content
  
  if (!content) {
    throw new Error('Empty response from AI')
  }
  
  return {
    content,
    responseTime: Date.now() - startTime,
  }
}

/**
 * Main function: Generate invoice items with automatic fallback
 */
export async function aiFallbackGenerate(
  prompt: string,
  language: 'en' | 'nl' = 'en'
): Promise<AIGenerateResult> {
  const providers = [PROVIDERS.local, PROVIDERS.openrouter, PROVIDERS.openai]
  const errors: string[] = []
  
  for (const provider of providers) {
    // Check if provider is configured/healthy
    const healthy = await checkHealth(provider)
    
    if (!healthy) {
      console.log(`[AI] Provider ${provider.name} not available, skipping...`)
      continue
    }
    
    try {
      console.log(`[AI] Trying ${provider.name}...`)
      
      const { content, responseTime } = await generateWithProvider(provider, prompt, language)
      
      // Parse the response
      const parsed = JSON.parse(content)
      const items = parsed.items || parsed
      
      // Calculate cost
      const estimatedTokens = (prompt.length + content.length) / 4
      const cost = (estimatedTokens / 1000) * provider.costPer1kTokens
      
      console.log(`[AI] Success with ${provider.name} in ${responseTime}ms, cost: $${cost.toFixed(6)}`)
      
      return {
        content,
        items,
        provider: provider.name,
        fallback: provider.name !== 'Local Qwen',
        cost,
        responseTime,
      }
      
    } catch (error: any) {
      console.error(`[AI] ${provider.name} failed:`, error.message)
      errors.push(`${provider.name}: ${error.message}`)
    }
  }
  
  // All providers failed
  throw new Error(`All AI providers failed. Errors: ${errors.join('; ')}`)
}

/**
 * Get status of all AI providers
 */
export async function getAIStatus(): Promise<{
  providers: Array<{
    name: string
    healthy: boolean
    costPer1kTokens: number
  }>
  primaryProvider: string
}> {
  const statuses = []
  
  for (const provider of [PROVIDERS.local, PROVIDERS.openrouter, PROVIDERS.openai]) {
    const healthy = await checkHealth(provider)
    statuses.push({
      name: provider.name,
      healthy,
      costPer1kTokens: provider.costPer1kTokens,
    })
  }
  
  // Determine primary provider
  const primary = statuses.find(s => s.healthy && s.costPer1kTokens === 0)?.name ||
    statuses.find(s => s.healthy)?.name ||
    'none'
  
  return {
    providers: statuses,
    primaryProvider: primary,
  }
}