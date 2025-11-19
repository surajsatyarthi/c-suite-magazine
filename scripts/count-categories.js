#!/usr/bin/env node
/**
 * Count total number of category documents in Sanity and print the result.
 */
const { createClient } = require('@sanity/client');
// Load environment variables from .env and .env.local if present
try {
  require('dotenv').config();
  require('dotenv').config({ path: '.env.local' });
} catch (_) {}

const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN || process.env.SANITY_READ_TOKEN || undefined;
const apiVersion = '2024-01-01';

if (!projectId || !dataset) {
  console.error('Missing SANITY_PROJECT_ID or SANITY_DATASET environment variables.');
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion, useCdn: false });

(async () => {
  try {
    const categories = await client.fetch(`*[_type == "category"]{_id, title, "slug": slug.current}`);
    const total = categories.length;
    console.log(`Total categories: ${total}`);

    // Optional: surface special categories if present
    const specials = ['opinion', 'cxo-interview', 'cxo interview'];
    const presentSpecials = categories
      .map((c) => (c.slug || '').toLowerCase())
      .filter((slug) => specials.includes(slug));
    if (presentSpecials.length > 0) {
      console.log(`Includes special categories: ${presentSpecials.join(', ')}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error querying categories:', err && err.message ? err.message : err);
    process.exit(2);
  }
})();
