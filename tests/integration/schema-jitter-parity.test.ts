
import { describe, it, expect } from 'vitest'
import { formatViewsMillion, getViewCountValue } from '@/lib/views'
import { generateStructuredData } from '@/lib/seo'

// Mock the slug to ensure deterministic jitter
const TEST_SLUG = 'example-ceo-interview'

describe('Issue #10: Schema/UI Parity (Jitter Logic)', () => {
  
  it('should have a helper to get raw numeric jitter value', () => {
    // This expects getViewCountValue to exist (it doesn't yet)
    const rawValue = getViewCountValue(0, TEST_SLUG)
    expect(typeof rawValue).toBe('number')
    expect(rawValue).toBeGreaterThan(2000000) // Baseline is 2.1M
  })

  it('should ensure UI format and Raw Value match', () => {
    const rawValue = getViewCountValue(0, TEST_SLUG)
    const uiString = formatViewsMillion(0, TEST_SLUG)
    
    // UI String is "X.X M".  Raw / 1M should be close to X.X
    const millions = rawValue / 1000000
    expect(uiString).toBe(`${millions.toFixed(1)} M`)
  })

  it('should inject InteractionCounter into Article Schema', () => {
    const rawValue = getViewCountValue(0, TEST_SLUG)
    
    // Generate Schema
    const schema = generateStructuredData('article', {
      title: 'Test Title',
      interactionCount: rawValue // New prop we need to add
    })

    expect(schema).toHaveProperty('interactionStatistic')
    if (!schema || typeof schema !== 'object') throw new Error('Schema missing')
    const safeSchema = schema as any
    expect(safeSchema.interactionStatistic).toEqual({
      '@type': 'InteractionCounter',
      'interactionType': 'https://schema.org/UserInteraction',
      'userInteractionCount': rawValue
    })
  })

  it('EDGE CASE: handles zero views gracefully', () => {
    // Should still return the baseline jitter (~2.1M) not 0
    const rawValue = getViewCountValue(0, TEST_SLUG)
    expect(rawValue).toBeGreaterThan(2000000) 
  })

  it('PARITY: verifies schema output parity with UI formatter', () => {
    const rawValue = getViewCountValue(0, TEST_SLUG)
    const uiString = formatViewsMillion(0, TEST_SLUG)
    
    // Generate Schema
    const schema = generateStructuredData('article', {
      title: 'Test Title',
      interactionCount: rawValue
    })
    
    // The Schema Number / 1M should approx equal the UI String Number
    // UI String is "2.4 M" -> Parse "2.4"
    const uiNumber = parseFloat(uiString.split(' ')[0])
    
    if (!schema || typeof schema !== 'object') {
      throw new Error('Schema generation failed')
    }
    const safeSchema = schema as any
    const schemaNumber = safeSchema.interactionStatistic.userInteractionCount / 1000000
    
    expect(schemaNumber.toFixed(1)).toBe(uiNumber.toString())
  })
})
