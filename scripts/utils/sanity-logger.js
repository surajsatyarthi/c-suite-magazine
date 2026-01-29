const { createClient } = require('@sanity/client');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Client with Write Token
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '2f93fcy8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_WRITE_TOKEN, // CRITICAL: Write access
  useCdn: false, // Always fresh for logs
  apiVersion: '2024-01-01',
});

/**
 * Logs a system event to Sanity
 * @param {string} systemName - Name of the automation (e.g. 'the-spider')
 * @param {'SUCCESS' | 'FAILURE' | 'WARNING'} status - Outcome
 * @param {string} message - Human readable summary
 * @param {object} [metadata] - Optional JSON details
 */
async function logSystemStatus(systemName, status, message, metadata = {}) {
  // Console fallback (Immediate feedback in CI logs)
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${systemName}] [${status}] ${message}`);

  if (!process.env.SANITY_WRITE_TOKEN) {
    console.warn('⚠️  No SANITY_WRITE_TOKEN found. Log not saved to Sanity.');
    return;
  }

  try {
    const doc = {
      _type: 'systemLog',
      system: systemName,
      status: status,
      message: message,
      metadata: JSON.stringify(metadata, null, 2),
      timestamp: timestamp
    };

    await client.create(doc);
    console.log(`✅ Log saved to Sanity: ${systemName} -> ${status}`);
  } catch (error) {
    console.error(`❌ Failed to save log to Sanity:`, error.message);
  }
}

module.exports = { logSystemStatus };
