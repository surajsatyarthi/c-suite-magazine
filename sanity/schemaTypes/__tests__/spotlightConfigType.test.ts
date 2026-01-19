import { describe, it, expect } from 'vitest'
import { spotlightConfigType } from '../spotlightConfigType'

describe('spotlightConfigType schema', () => {
  it('should have correct name and type', () => {
    expect(spotlightConfigType.name).toBe('spotlightConfig')
    expect(spotlightConfigType.type).toBe('document')
    expect(spotlightConfigType.title).toContain('Spotlight')
  })

  it('should have enhanced title with emoji', () => {
    expect(spotlightConfigType.title).toMatch(/⭐|🌟/)
  })

  it('should have title field hidden', () => {
    const titleField = spotlightConfigType.fields.find((f: any) => f.name === 'title')
    expect(titleField).toBeDefined()
    expect(titleField.hidden).toBe(true)
    expect(titleField.initialValue).toBe('Homepage Spotlight')
  })

  it('should have cardCount with proper validation and description', () => {
    const cardCountField = spotlightConfigType.fields.find((f: any) => f.name === 'cardCount')
    expect(cardCountField).toBeDefined()
    expect(cardCountField.type).toBe('number')
    expect(cardCountField.initialValue).toBe(13)
    expect(cardCountField.title).toContain('Display Count')
    expect(cardCountField.description).toContain('hero')
    expect(cardCountField.description).toContain('grid')
  })

  it('should have items array field with helpful description', () => {
    const itemsField = spotlightConfigType.fields.find((f: any) => f.name === 'items')
    expect(itemsField).toBeDefined()
    expect(itemsField.type).toBe('array')
    expect(itemsField.description).toContain('Drag to reorder')
    expect(itemsField.description).toContain('Hero')
  })

  it('should have preview function with correct selectors', () => {
    expect(spotlightConfigType.preview).toBeDefined()
    expect(spotlightConfigType.preview.select).toHaveProperty('items')
    expect(spotlightConfigType.preview.select).toHaveProperty('cardCount')
    expect(spotlightConfigType.preview.prepare).toBeDefined()
  })

  it('should show correct preview subtitle', () => {
    const mockData = {
      items: [{}, {}, {}], // 3 items
      cardCount: 13
    }
    const result = spotlightConfigType.preview.prepare(mockData)
    expect(result.subtitle).toContain('3 articles')
    expect(result.subtitle).toContain('13')
  })
})
