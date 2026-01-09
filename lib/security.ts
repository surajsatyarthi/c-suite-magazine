import { NextRequest, NextResponse } from 'next/server'

/**
 * Basic security middleware for Sanity free plan
 * Implements rate limiting, referer checking, and content validation
 */

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10
const requestCounts = new Map<string, { count: number; resetTime: number }>()

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0] || realIP || 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const clientData = requestCounts.get(ip)
  
  if (!clientData || now > clientData.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }
  
  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return true
  }
  
  clientData.count++
  return false
}

function isValidReferer(request: NextRequest): boolean {
  const referer = request.headers.get('referer')
  if (!referer) return false
  
  const allowedDomains = [
    'localhost:3000',
    'csuitemagazine.global',
    'csuitemagazine.vercel.app'
  ]
  
  try {
    const url = new URL(referer)
    return allowedDomains.some(domain => url.hostname.includes(domain))
  } catch {
    return false
  }
}

function validateContentType(request: NextRequest, expectedTypes: string[]): boolean {
  const contentType = request.headers.get('content-type') || ''
  return expectedTypes.some(type => contentType.includes(type))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizePayload(payload: any): { valid: boolean; error?: string } {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Invalid payload format' }
  }
  
  // Check for spam patterns
  const stringified = JSON.stringify(payload).toLowerCase()
  const spamPatterns = [
    'viagra', 'cialis', 'casino', 'poker', 'xxx', 'porn',
    'http://', 'https://', '<script', 'javascript:',
    'eval(', 'onclick', 'onload', 'onerror'
  ]
  
  const hasSpam = spamPatterns.some(pattern => stringified.includes(pattern))
  if (hasSpam) {
    return { valid: false, error: 'Content contains suspicious patterns' }
  }
  
  // Check payload size (max 100KB for free plan)
  const payloadSize = new TextEncoder().encode(stringified).length
  if (payloadSize > 100 * 1024) {
    return { valid: false, error: 'Payload too large' }
  }
  
  return { valid: true }
}

export type ValidationResult = {
  isValid: boolean
  error?: NextResponse
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any
}

export async function validateWriteRequest(
  request: NextRequest, 
  options: {
    requireReferer?: boolean
    validateContent?: boolean
    allowedContentTypes?: string[]
  } = {}
): Promise<ValidationResult> {
  const ip = getClientIP(request)
  
  // Rate limiting check
  if (isRateLimited(ip)) {
    return {
      isValid: false,
      error: NextResponse.json(
        { ok: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }
  }
  
  // Referer validation (optional but recommended)
  if (options.requireReferer && !isValidReferer(request)) {
    return {
      isValid: false,
      error: NextResponse.json(
        { ok: false, error: 'Invalid request origin' },
        { status: 403 }
      )
    }
  }
  
  // Content type validation
  if (options.allowedContentTypes?.length) {
    if (!validateContentType(request, options.allowedContentTypes)) {
      return {
        isValid: false,
        error: NextResponse.json(
          { ok: false, error: 'Invalid content type' },
          { status: 400 }
        )
      }
    }
  }
  
  // Content validation
  if (options.validateContent) {
    try {
      const payload = await request.json()
      const validation = sanitizePayload(payload)
      
      if (!validation.valid) {
        return {
          isValid: false,
          error: NextResponse.json(
            { ok: false, error: validation.error },
            { status: 400 }
          )
        }
      }

      // Return validated payload so caller doesn't need to re-parse (and fail)
      return { isValid: true, payload }
    } catch (e) { // eslint-disable-line @typescript-eslint/no-unused-vars
      return {
        isValid: false,
        error: NextResponse.json(
          { ok: false, error: 'Invalid JSON payload' },
          { status: 400 }
        )
      }
    }
  }
  
  return { isValid: true }
}

export function validateImageUpload(file: File): { valid: boolean; error?: string } {
  // Check file size (max 5MB for free plan)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'Image too large (max 5MB)' }
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid image format. Use JPG, PNG, WebP, or GIF.' }
  }
  
  return { valid: true }
}

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [ip, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(ip)
    }
  }
}, 5 * 60 * 1000)
