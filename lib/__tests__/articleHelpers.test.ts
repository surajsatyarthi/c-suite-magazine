import { describe, it, expect } from 'vitest'
import { getHeroTagline, getArticleType } from '../articleHelpers'
import { Post } from '../types'

describe('Hero Tagline Extraction', () => {
  it('extracts India energy from CSA title', () => {
    const article: Partial<Post> = {
      title: "Shrikant Vaidya: Leading India's Energy Transition",
      categories: [{ slug: { current: 'company-sponsored' }, title: 'Company Sponsored' }],
    }
    const tagline = getHeroTagline(article as Post)
    expect(tagline).toBe("INDIA'S ENERGY TRANSITION")
  })

  it('returns EXECUTIVE INSIGHTS for interviews', () => {
    const article: Partial<Post> = {
      title: 'Interview with CEO',
      categories: [{ slug: { current: 'cxo-interview' }, title: 'CXO Interview' }],
    }
    expect(getHeroTagline(article as Post)).toBe('EXECUTIVE INSIGHTS')
  })

  it('returns INDUSTRY JUGGERNAUT for juggernaut tagged articles', () => {
    const article: Partial<Post> = {
      title: 'Some Article',
      tags: ['Industry Juggernaut'],
      categories: [{ slug: { current: 'technology' }, title: 'Technology' }],
    }
    expect(getHeroTagline(article as Post)).toBe('INDUSTRY JUGGERNAUT')
  })

  it('truncates long taglines to 40 chars', () => {
    const article: Partial<Post> = {
      title: "The Indian Institute of Management Nagpur Director's Vision",
      categories: [{ slug: { current: 'company-sponsored' }, title: 'Company Sponsored' }],
    }
    const tagline = getHeroTagline(article as Post)
    expect(tagline!.length).toBeLessThanOrEqual(40)
  })

  it('uses manual override when provided', () => {
    const article: any = {
      heroTagline: 'CUSTOM TAGLINE',
      title: 'Some Title',
      categories: [{ slug: { current: 'company-sponsored' }, title: 'Company Sponsored' }],
    }
    expect(getHeroTagline(article)).toBe('CUSTOM TAGLINE')
  })

  it('returns FEATURED as fallback', () => {
    const article: Partial<Post> = {
      title: 'Standard Article',
      categories: [{ slug: { current: 'uncategorized' }, title: 'Uncategorized' }],
    }
    expect(getHeroTagline(article as Post)).toBe('UNCATEGORIZED')
  })
})

describe('Article Type Detection', () => {
  it('returns CSA for company-sponsored articles', () => {
    const article: Partial<Post> = {
      categories: [{ slug: { current: 'company-sponsored' }, title: 'Company Sponsored' }],
    }
    const type = getArticleType(article as Post)
    expect(type).toBe('csa')
  })

  it('returns interview for cxo-interview articles', () => {
    const article: Partial<Post> = {
      categories: [{ slug: { current: 'cxo-interview' }, title: 'CXO Interview' }],
    }
    expect(getArticleType(article as Post)).toBe('interview')
  })

  it('returns juggernaut for juggernaut tagged articles', () => {
    const article: Partial<Post> = {
      tags: ['Industry Juggernaut'],
      categories: [{ slug: { current: 'technology' }, title: 'Technology' }],
    }
    expect(getArticleType(article as Post)).toBe('juggernaut')
  })

  it('returns spotlight for cxo-spotlight articles', () => {
    const article: Partial<Post> = {
      categories: [{ slug: { current: 'cxo-spotlight' }, title: 'CXO Spotlight' }],
    }
    expect(getArticleType(article as Post)).toBe('spotlight')
  })

  it('returns null for standard articles', () => {
    const article: Partial<Post> = {
      categories: [{ slug: { current: 'technology' }, title: 'Technology' }],
    }
    expect(getArticleType(article as Post)).toBeNull()
  })

  it('prioritizes juggernaut tag over category', () => {
    const article: Partial<Post> = {
      tags: ['Industry Juggernaut'],
      categories: [{ slug: { current: 'cxo-interview' }, title: 'CXO Interview' }],
    }
    expect(getArticleType(article as Post)).toBe('juggernaut')
  })
})
