import dotenv from 'dotenv'
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Load environment variables manually for Vitest (Next.js doesn't do this for us here)
dotenv.config({ path: '.env.local' })
dotenv.config() 

// Automatically cleanup after each test to prevent memory leaks and state pollution
afterEach(() => {
  cleanup()
})
