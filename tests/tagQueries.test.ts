import { describe, it, expect } from 'vitest'
import { processPopularTags } from '../sanity/lib/tagQueries'

describe('Tag Query Logic', () => {
  describe('processPopularTags', () => {
    it('should correctly count and filter tags', () => {
      const mockPosts = [
        { tags: ['AI', 'Tech', 'AI'] },
        { tags: ['Tech', 'Leadership'] },
        { tags: ['AI', 'Innovation'] }
      ]
      
      const result = processPopularTags(mockPosts)
      
      // AI used 3 times, Tech used 2 times
      // Leadership and Innovation used 1 time (should be filtered out)
      expect(result).toContain('AI')
      expect(result).toContain('Tech')
      expect(result).not.toContain('Leadership')
      expect(result).not.toContain('Innovation')
      expect(result[0]).toBe('AI') // Most popular first
    })

    it('should handle null or non-array input gracefully', () => {
      // @ts-expect-error Testing invalid input
      expect(processPopularTags(null)).toEqual([]);
      // @ts-expect-error Testing invalid input
      expect(processPopularTags(undefined)).toEqual([]);
    });

    it('should return empty array if no tags meet popularity threshold', () => {
      const mockPosts = [
        { tags: ['Tag1'] },
        { tags: ['Tag2'] }
      ]
      const result = processPopularTags(mockPosts);
      expect(result).toEqual([]);
    });

    it('should handle empty or undefined tags gracefully', () => {
      const mockPosts = [
        { tags: [] as string[] },
        { tags: undefined } as unknown as { tags: string[] }
      ]
      
      const result = processPopularTags(mockPosts)
      expect(result).toEqual([])
    })

    it('should trim whitespace from tags', () => {
      const mockPosts = [
        { tags: [' AI ', 'AI'] },
        { tags: ['AI'] }
      ]
      
      const result = processPopularTags(mockPosts)
      expect(result).toEqual(['AI'])
    })

    it('should be case sensitive (as per requirement to keep normalization separate)', () => {
      const mockPosts = [
        { tags: ['AI', 'ai'] },
        { tags: ['AI', 'ai'] }
      ]
      
      const result = processPopularTags(mockPosts)
      expect(result).toContain('AI')
      expect(result).toContain('ai')
    })
  })
})
