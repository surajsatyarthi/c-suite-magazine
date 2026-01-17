
import { isAuthenticated } from '../../lib/api-auth'
import { NextRequest } from 'next/server'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('lib/api-auth', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns false if no authorization header', () => {
    const req = new NextRequest('http://localhost')
    expect(isAuthenticated(req)).toBe(false)
  })

  it('returns false if authorization header is not Bearer', () => {
    const req = new NextRequest('http://localhost', {
      headers: { authorization: 'Basic 123' }
    })
    expect(isAuthenticated(req)).toBe(false)
  })

  it('returns false if no secret is configured', () => {
    delete process.env.API_SECRET
    delete process.env.CRON_SECRET
    delete process.env.VERCEL_WEBHOOK_SECRET

    const req = new NextRequest('http://localhost', {
      headers: { authorization: 'Bearer secret' }
    })
    expect(isAuthenticated(req)).toBe(false)
  })

  it('returns true if token matches API_SECRET', () => {
    process.env.API_SECRET = 'my-secret'
    const req = new NextRequest('http://localhost', {
      headers: { authorization: 'Bearer my-secret' }
    })
    expect(isAuthenticated(req)).toBe(true)
  })

  it('returns true if token matches CRON_SECRET', () => {
    delete process.env.API_SECRET
    process.env.CRON_SECRET = 'cron-secret'
    const req = new NextRequest('http://localhost', {
      headers: { authorization: 'Bearer cron-secret' }
    })
    expect(isAuthenticated(req)).toBe(true)
  })

  it('returns true if token matches VERCEL_WEBHOOK_SECRET', () => {
    delete process.env.API_SECRET
    delete process.env.CRON_SECRET
    process.env.VERCEL_WEBHOOK_SECRET = 'vercel-secret'
    const req = new NextRequest('http://localhost', {
      headers: { authorization: 'Bearer vercel-secret' }
    })
    expect(isAuthenticated(req)).toBe(true)
  })

  it('returns false if token does not match', () => {
    process.env.API_SECRET = 'my-secret'
    const req = new NextRequest('http://localhost', {
      headers: { authorization: 'Bearer wrong-secret' }
    })
    expect(isAuthenticated(req)).toBe(false)
  })
})
