import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock window and gtag before importing analytics
const mockGtag = vi.fn()

// Setup global mocks
vi.stubGlobal('window', {
  gtag: mockGtag,
  location: { pathname: '/test-article' }
})

// Import after mocking
import { 
  trackAdImpression, 
  trackAdClick, 
  trackPopupView, 
  trackPopupClose 
} from '../analytics'

describe('Analytics Tracking Functions', () => {
  beforeEach(() => {
    mockGtag.mockClear()
  })

  describe('trackAdImpression', () => {
    it('should send ad_impression event with correct parameters', () => {
      trackAdImpression({
        ad_name: 'Test Banner',
        ad_placement: 'sidebar',
        ad_url: 'https://example.com/ad',
        ad_id: 'banner-001'
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'ad_impression', {
        ad_id: 'banner-001',
        ad_name: 'Test Banner',
        ad_placement: 'sidebar',
        ad_url: 'https://example.com/ad',
        page_path: '/test-article'
      })
    })

    it('should use provided article_path over window.location', () => {
      trackAdImpression({
        ad_name: 'Test Banner',
        ad_placement: 'in-article',
        article_path: '/custom-path'
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'ad_impression', 
        expect.objectContaining({
          page_path: '/custom-path'
        })
      )
    })
  })

  describe('trackAdClick', () => {
    it('should send ad_click event with correct parameters', () => {
      trackAdClick({
        ad_name: 'Partner Ad',
        ad_placement: 'popup',
        ad_url: 'https://partner.com'
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'ad_click', 
        expect.objectContaining({
          ad_name: 'Partner Ad',
          ad_placement: 'popup',
          ad_url: 'https://partner.com'
        })
      )
    })
  })

  describe('trackPopupView', () => {
    it('should send ad_popup_view event', () => {
      trackPopupView({
        ad_name: 'Popup Ad',
        ad_placement: 'popup',
        ad_url: 'https://example.com/popup'
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'ad_popup_view',
        expect.objectContaining({
          ad_name: 'Popup Ad',
          ad_placement: 'popup'
        })
      )
    })
  })

  describe('trackPopupClose', () => {
    it('should send ad_popup_close event without ad_url', () => {
      trackPopupClose({
        ad_name: 'Popup Ad',
        ad_placement: 'popup'
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'ad_popup_close',
        expect.objectContaining({
          ad_name: 'Popup Ad',
          ad_placement: 'popup'
        })
      )
    })
  })

  describe('edge cases', () => {
    it('should handle missing optional parameters gracefully', () => {
      trackAdImpression({
        ad_name: 'Minimal Ad',
        ad_placement: 'scroll-trigger'
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'ad_impression',
        expect.objectContaining({
          ad_name: 'Minimal Ad',
          ad_placement: 'scroll-trigger',
          ad_id: undefined,
          ad_url: undefined
        })
      )
    })
  })
})
