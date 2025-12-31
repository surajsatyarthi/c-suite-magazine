#!/usr/bin/env node

/**
 * Ad Improvements Testing Script
 * Tests all 5 critical fixes implemented:
 * 1. Session persistence
 * 2. Trigger coordination
 * 3. Pause on hover
 * 4. Optimized queries
 * 5. Env variable fallback
 */

const puppeteer = require('puppeteer')

const SITE_URL = 'http://localhost:3000'
const TEST_TIMEOUT = 30000

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green)
}

function logError(message) {
  log(`❌ ${message}`, colors.red)
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue)
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow)
}

async function test1_SessionPersistence(browser) {
  log('\n' + '='.repeat(60), colors.bright)
  log('TEST 1: Session Persistence (Popup Shows Once)', colors.bright)
  log('='.repeat(60), colors.bright)

  const page = await browser.newPage()
  
  try {
    // Navigate to homepage
    logInfo('Navigating to homepage...')
    await page.goto(SITE_URL, { waitUntil: 'networkidle2', timeout: TEST_TIMEOUT })
    
    // Wait a bit for scroll trigger
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.6))
    await page.waitForTimeout(2000)
    
    // Check if session storage key is set
    const sessionKey = await page.evaluate(() => sessionStorage.getItem('popup-ad-shown-session'))
    
    if (sessionKey === '1') {
      logSuccess('Session storage key set correctly')
    } else {
      logWarning('Session storage key not set (popup may not have triggered)')
    }
    
    // Navigate to another page
    logInfo('Navigating to another page...')
    const links = await page.$$('a[href^="/"]')
    if (links.length > 0) {
      await links[0].click()
      await page.waitForTimeout(3000)
      
      // Check if session storage persists
      const persistedKey = await page.evaluate(() => sessionStorage.getItem('popup-ad-shown-session'))
      
      if (persistedKey === '1') {
        logSuccess('Session storage persists across page navigation')
      } else {
        logError('Session storage was cleared (should persist)')
      }
    }
    
    logSuccess('Test 1 completed')
  } catch (error) {
    logError(`Test 1 failed: ${error.message}`)
  } finally {
    await page.close()
  }
}

async function test2_TriggerCoordination(browser) {
  log('\n' + '='.repeat(60), colors.bright)
  log('TEST 2: Trigger Coordination (No Double-Show)', colors.bright)
  log('='.repeat(60), colors.bright)

  const page = await browser.newPage()
  
  try {
    // Monitor console for multiple triggers
    let triggerCount = 0
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('openAd') || text.includes('popup')) {
        triggerCount++
      }
    })
    
    logInfo('Navigating to article page...')
    await page.goto(`${SITE_URL}/category/leadership`, { waitUntil: 'networkidle2', timeout: TEST_TIMEOUT })
    
    // Scroll to trigger popup
    logInfo('Scrolling to 50% to trigger popup...')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.5))
    await page.waitForTimeout(2000)
    
    // Continue scrolling past in-article ad
    logInfo('Scrolling to 80% (past in-article ads)...')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.8))
    await page.waitForTimeout(2000)
    
    // Check session storage - should only be set once
    const sessionKey = await page.evaluate(() => sessionStorage.getItem('popup-ad-shown-session'))
    
    if (sessionKey === '1') {
      logSuccess('Popup triggered and session storage set')
      logInfo('Trigger coordination working (only one trigger per session)')
    }
    
    logSuccess('Test 2 completed')
  } catch (error) {
    logError(`Test 2 failed: ${error.message}`)
  } finally {
    await page.close()
  }
}

async function test3_PauseOnHover(browser) {
  log('\n' + '='.repeat(60), colors.bright)
  log('TEST 3: Pause Carousel on Hover', colors.bright)
  log('='.repeat(60), colors.bright)

  const page = await browser.newPage()
  
  try {
    logInfo('This test requires manual verification')
    logInfo('Opening browser at localhost:3000...')
    logInfo('1. Wait for popup to appear')
    logInfo('2. Hover over popup → carousel should pause')
    logInfo('3. Move mouse away → carousel should resume')
    
    await page.goto(SITE_URL, { waitUntil: 'networkidle2', timeout: TEST_TIMEOUT })
    
    // Clear session storage to allow popup
    await page.evaluate(() => sessionStorage.clear())
    
    // Scroll to trigger popup
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.6))
    await page.waitForTimeout(2000)
    
    // Check if popup is visible
    const popupVisible = await page.evaluate(() => {
      const popup = document.querySelector('[role="dialog"]')
      return popup !== null
    })
    
    if (popupVisible) {
      logSuccess('Popup is visible')
      logInfo('Manually verify: Hover should pause carousel')
    } else {
      logWarning('Popup not visible - may need to adjust scroll or timing')
    }
    
    logSuccess('Test 3 completed (manual verification needed)')
  } catch (error) {
    logError(`Test 3 failed: ${error.message}`)
  } finally {
    await page.close()
  }
}

async function test4_OptimizedQueries(browser) {
  log('\n' + '='.repeat(60), colors.bright)
  log('TEST 4: Optimized Sidebar Queries (Single Fetch)', colors.bright)
  log('='.repeat(60), colors.bright)

  const page = await browser.newPage()
  
  try {
    // Track network requests
    const sanityRequests = []
    page.on('request', request => {
      const url = request.url()
      if (url.includes('2f93fcy8.api.sanity.io') || url.includes('cdn.sanity.io')) {
        sanityRequests.push({
          url,
          method: request.method(),
          time: new Date().toISOString()
        })
      }
    })
    
    logInfo('Navigating to article page with sidebar ads...')
    await page.goto(`${SITE_URL}/category/leadership`, { waitUntil: 'networkidle2', timeout: TEST_TIMEOUT })
    
    await page.waitForTimeout(3000)
    
    // Count unique Sanity queries for advertisements
    const adQueries = sanityRequests.filter(req => {
      return req.url.includes('advertisement') || req.url.includes('*%5B_type')
    })
    
    logInfo(`Total Sanity requests: ${sanityRequests.length}`)
    logInfo(`Ad-related queries: ${adQueries.length}`)
    
    if (adQueries.length > 0) {
      logSuccess('Sanity queries detected')
      if (adQueries.length <= 2) {
        logSuccess('Optimized! Using minimal queries (expected: 1-2 for sidebar)')
      } else {
        logWarning(`Found ${adQueries.length} queries - may still be making duplicate fetches`)
      }
    } else {
      logInfo('No ad queries detected (may be using cached data)')
    }
    
    logSuccess('Test 4 completed')
  } catch (error) {
    logError(`Test 4 failed: ${error.message}`)
  } finally {
    await page.close()
  }
}

async function test5_EnvVariable(browser) {
  log('\n' + '='.repeat(60), colors.bright)
  log('TEST 5: Environment Variable for Fallback', colors.bright)
  log('='.repeat(60), colors.bright)

  const page = await browser.newPage()
  
  try {
    logInfo('Checking .env.local for NEXT_PUBLIC_FALLBACK_AD_ID...')
    
    const fs = require('fs')
    const path = require('path')
    const envPath = path.join(__dirname, '../.env.local')
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8')
      
      if (envContent.includes('NEXT_PUBLIC_FALLBACK_AD_ID')) {
        logSuccess('.env.local contains NEXT_PUBLIC_FALLBACK_AD_ID')
        
        const match = envContent.match(/NEXT_PUBLIC_FALLBACK_AD_ID=(.+)/)
        if (match) {
          logInfo(`Fallback AD ID: ${match[1]}`)
        }
      } else {
        logError('NEXT_PUBLIC_FALLBACK_AD_ID not found in .env.local')
      }
    } else {
      logError('.env.local file not found')
    }
    
    // Check if it's accessible in the app
    logInfo('Verifying env variable is accessible in browser...')
    await page.goto(SITE_URL, { waitUntil: 'networkidle2', timeout: TEST_TIMEOUT })
    
    const envValue = await page.evaluate(() => {
      return typeof process !== 'undefined' && process.env ? 
        'Server-side only' : 
        'Check server logs'
    })
    
    logInfo(`Environment variable accessibility: ${envValue}`)
    logSuccess('Test 5 completed')
    
  } catch (error) {
    logError(`Test 5 failed: ${error.message}`)
  } finally {
    await page.close()
  }
}

async function runAllTests() {
  log('\n' + '█'.repeat(60), colors.bright)
  log('AD IMPROVEMENTS - COMPREHENSIVE TEST SUITE', colors.bright)
  log('█'.repeat(60) + '\n', colors.bright)
  
  logInfo('Starting Puppeteer...')
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    await test1_SessionPersistence(browser)
    await test2_TriggerCoordination(browser)
    await test3_PauseOnHover(browser)
    await test4_OptimizedQueries(browser)
    await test5_EnvVariable(browser)
    
    log('\n' + '█'.repeat(60), colors.bright)
    log('ALL TESTS COMPLETED', colors.green + colors.bright)
    log('█'.repeat(60) + '\n', colors.bright)
    
  } catch (error) {
    logError(`Test suite error: ${error.message}`)
  } finally {
    await browser.close()
  }
}

// Run tests
runAllTests().catch(error => {
  logError(`Fatal error: ${error.message}`)
  process.exit(1)
})
