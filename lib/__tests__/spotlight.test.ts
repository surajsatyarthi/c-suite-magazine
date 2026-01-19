import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSpotlightItems, processSpotlightItems } from '../spotlight'

// Mock Sanity client
vi.mock('../sanity', () => ({
  client: {
    fetch: vi.fn()
  },
  urlFor: vi.fn(() => ({
    width: () => ({ height: () => ({ url: () => 'https://example.com/img.jpg' }) })
  }))
}))

describe('getSpotlightItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch spotlight config from Sanity', async () => {
    const { client } = await import('../sanity')
    vi.mocked(client.fetch).mockResolvedValue({
      cardCount: 12,
      items: [
        {
          _id: '1',
          _type: 'post',
          title: 'Test Article',
          slug: { current: 'test-article' },
          mainImage: { asset: { _ref: 'img-1' } },
          primaryCategory: { slug: { current: 'leadership' } }
        }
      ]
    })

    const result = await getSpotlightItems()

    expect(result.items).toHaveLength(1)
    expect(result.desiredCount).toBe(12)
    expect(result.items[0].title).toBe('Test Article')
  })

  it('should handle empty spotlight config', async () => {
    const { client } = await import('../sanity')
    vi.mocked(client.fetch).mockResolvedValue({ items: [], cardCount: 12 })

    const result = await getSpotlightItems()

    expect(result.items).toHaveLength(0)
    expect(result.desiredCount).toBe(12)
  })

  it('should handle fetch errors gracefully', async () => {
    const { client } = await import('../sanity')
    vi.mocked(client.fetch).mockRejectedValue(new Error('Network error'))

    const result = await getSpotlightItems()

    expect(result.items).toEqual([])
  })
})

describe('processSpotlightItems', () => {
  it('should limit to desiredCount', () => {
    const items = Array(20).fill(null).map((_, i) => ({
      image: `img-${i}`,
      href: `/article-${i}`,
      title: `Article ${i}`
    }))

    const result = processSpotlightItems(items, 12)

    expect(result).toHaveLength(12)
  })

  it('should use default count of 13 when undefined', () => {
    const items = Array(20).fill(null).map((_, i) => ({
      image: `img-${i}`,
      href: `/article-${i}`,
      title: `Article ${i}`
    }))

    const result = processSpotlightItems(items, undefined)

    expect(result).toHaveLength(12)
  })

  it('should handle fewer items than count', () => {
    const items = Array(5).fill(null).map((_, i) => ({
      image: `img-${i}`,
      href: `/article-${i}`,
      title: `Article ${i}`
    }))

    const result = processSpotlightItems(items, 12)

    expect(result).toHaveLength(5)
  })
})
