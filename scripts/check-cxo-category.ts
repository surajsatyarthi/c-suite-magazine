import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
});

async function checkCategory() {
  const slug = 'cxo-interview';
  const query = `*[_type == "category" && slug.current == $slug][0]`;
  const result = await client.fetch(query, { slug });
  console.log(`Category "${slug}":`, result ? 'FOUND' : 'NOT FOUND');
  if (result) {
    console.log('Details:', JSON.stringify(result, null, 2));
  }
}

checkCategory().catch(console.error);
