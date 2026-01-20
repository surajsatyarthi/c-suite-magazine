import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock server-only
vi.mock('server-only', () => ({}))

// Mock performance.now
const mockPerformanceNow = vi.fn()
vi.stubGlobal('performance', { now: mockPerformanceNow })

// Mock console.warn to capture guardian warnings
const mockWarn = vi.fn()
vi.stubGlobal('console', { ...console, warn: mockWarn })

// Import after mocking
import { guardian } from '../guardian'

describe('Guardian Query Monitor', () => {
  beforeEach(() => {
    mockWarn.mockClear()
    mockPerformanceNow.mockClear()
    // Default: simulate fast query
    vi.stubEnv('NODE_ENV', 'development')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('production mode', () => {
    it('should passthrough without monitoring in production', async () => {
      vi.stubEnv('NODE_ENV', 'production')
      
      const queryResult = { rows: Array(200).fill({}) }
      const queryPromise = Promise.resolve(queryResult)
      
      const result = await guardian.monitor(queryPromise, 'TestQuery')
      
      expect(result).toBe(queryResult)
      expect(mockWarn).not.toHaveBeenCalled()
    })
  })

  describe('speed limit enforcement', () => {
    it('should warn when query exceeds 100ms', async () => {
      // Simulate slow query: 0ms start, 150ms end
      mockPerformanceNow
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(150)
      
      const queryResult = { rows: [{}] }
      const result = await guardian.monitor(
        Promise.resolve(queryResult), 
        'SlowQuery'
      )
      
      expect(result).toEqual(queryResult)
      expect(mockWarn).toHaveBeenCalled()
      expect(mockWarn.mock.calls[0][0]).toContain('Speed Limit Exceeded')
      expect(mockWarn.mock.calls[0][0]).toContain('SlowQuery')
    })

    it('should not warn for queries under 100ms', async () => {
      mockPerformanceNow
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(50) // 50ms - under limit
      
      const queryResult = { rows: [{}] }
      await guardian.monitor(Promise.resolve(queryResult), 'FastQuery')
      
      expect(mockWarn).not.toHaveBeenCalled()
    })
  })

  describe('mass limit enforcement', () => {
    it('should warn when result exceeds 100 rows', async () => {
      mockPerformanceNow
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(10) // Fast query
      
      const queryResult = { rows: Array(150).fill({}) } // 150 rows
      await guardian.monitor(Promise.resolve(queryResult), 'MassiveQuery')
      
      expect(mockWarn).toHaveBeenCalled()
      expect(mockWarn.mock.calls[0][0]).toContain('Mass Limit Exceeded')
      expect(mockWarn.mock.calls[0][0]).toContain('150')
    })

    it('should not warn for results under 100 rows', async () => {
      mockPerformanceNow
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(10)
      
      const queryResult = { rows: Array(50).fill({}) } // 50 rows
      await guardian.monitor(Promise.resolve(queryResult), 'SmallQuery')
      
      expect(mockWarn).not.toHaveBeenCalled()
    })

    it('should not warn for exactly 100 rows', async () => {
      mockPerformanceNow
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(10)
      
      const queryResult = { rows: Array(100).fill({}) } // Exactly 100
      await guardian.monitor(Promise.resolve(queryResult), 'EdgeQuery')
      
      expect(mockWarn).not.toHaveBeenCalled()
    })
  })

  describe('combined violations', () => {
    it('should warn for both speed and mass violations', async () => {
      mockPerformanceNow
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(200) // 200ms - slow
      
      const queryResult = { rows: Array(200).fill({}) } // 200 rows
      await guardian.monitor(Promise.resolve(queryResult), 'TerribleQuery')
      
      // Should have 2 warnings
      expect(mockWarn).toHaveBeenCalledTimes(2)
    })
  })

  describe('error handling', () => {
    it('should rethrow query errors', async () => {
      mockPerformanceNow.mockReturnValue(0)
      
      const error = new Error('Database connection failed')
      const failingPromise = Promise.reject(error)
      
      await expect(guardian.monitor(failingPromise, 'FailingQuery'))
        .rejects.toThrow('Database connection failed')
    })
  })

  describe('context reporting', () => {
    it('should use default context when not provided', async () => {
      mockPerformanceNow
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(200)
      
      const queryResult = { rows: [{}] }
      await guardian.monitor(Promise.resolve(queryResult))
      
      expect(mockWarn.mock.calls[0][0]).toContain('Anonymous Query')
    })
  })
})
