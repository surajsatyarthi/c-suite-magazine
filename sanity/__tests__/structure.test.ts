import { describe, it, expect } from 'vitest'

describe('Sanity Studio structure', () => {
  it('should export a structure function', async () => {
    const { structure } = await import('../structure')
    expect(typeof structure).toBe('function')
  })

  // Note: Full structure testing would require complex mocking of Sanity's structure builder
  // For this implementation, we rely on manual verification in Sanity Studio
  // The key verification is that the structure file compiles and exports correctly

  it('should have structure function that accepts builder parameter', async () => {
    const { structure } = await import('../structure')
    expect(structure.length).toBe(1) // Accepts one parameter (S - the structure builder)
  })
})
