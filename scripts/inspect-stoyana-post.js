#!/usr/bin/env node

const { createClient } = require('@sanity/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  useCdn: false,
});

async function main() {
  const query = `*[_type == "post" && slug.current == "stoyana-natseva"][0] {
    title,
    excerpt,
    body
  }`;
  const post = await client.fetch(query);
  console.log(JSON.stringify(post, null, 2));
}

main().catch(console.error);