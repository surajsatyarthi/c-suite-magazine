/**
 * Test file for analytics tracking functions
 * Run with: npx tsx tests/analytics.test.ts
 */

// Mock window.gtag
const mockEvents: Array<{ event: string; params: any }> = []

global.window = {
  gtag: (...args: any[]) => {
    const [command, event, params] = args
    if (command === 'event') {
      mockEvents.push({ event, params })
      console.log(`✅ Event tracked: ${event}`, params)
    }
  },
  location: {
    pathname: '/test-article'
  }
} as any

// Import after mocking
import { trackAdImpression, trackAdClick, trackPopupView, trackPopupClose } from '../lib/analytics'

console.log('🧪 Testing Analytics Functions\n')

// Test 1: Ad Impression Tracking
console.log('Test 1: trackAdImpression')
trackAdImpression({
  ad_name: 'Test Banner Ad',
  ad_placement: 'in-article',
  ad_url: 'https://example.com/ad',
})
console.log('')

// Test 2: Ad Click Tracking
console.log('Test 2: trackAdClick')
trackAdClick({
  ad_name: 'Test Banner Ad',
  ad_placement: 'sidebar',
  ad_url: 'https://example.com/ad',
})
console.log('')

// Test 3: Popup View Tracking
console.log('Test 3: trackPopupView')
trackPopupView({
  ad_name: 'Test Popup Ad',
  ad_placement: 'popup',
  ad_url: 'https://example.com/popup',
})
console.log('')

// Test 4: Popup Close Tracking
console.log('Test 4: trackPopupClose')
trackPopupClose({
  ad_name: 'Test Popup Ad',
  ad_placement: 'popup',
})
console.log('')

// Verify all events were tracked
console.log('📊 Summary:')
console.log(`Total events tracked: ${mockEvents.length}`)
console.log(`Expected: 4`)

if (mockEvents.length === 4) {
  console.log('✅ All tracking functions work correctly!')
} else {
  console.log('❌ Some tracking functions failed')
  process.exit(1)
}

// Verify event types
const eventTypes = mockEvents.map(e => e.event)
const expectedTypes = ['ad_impression', 'ad_click', 'ad_popup_view', 'ad_popup_close']

console.log('\nEvent types tracked:', eventTypes)
console.log('Expected types:', expectedTypes)

const allTypesMatch = expectedTypes.every(type => eventTypes.includes(type))
if (allTypesMatch) {
  console.log('✅ All event types correct!')
} else {
  console.log('❌ Event types mismatch')
  process.exit(1)
}

console.log('\n✅ All tests passed!')
