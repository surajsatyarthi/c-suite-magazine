const { createClient } = require('@sanity/client');
require('dotenv').config({ path: './.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const postIds = [
  '6FGiNia5tWM9A0y146SyqV',
  '6FGiNia5tWM9A0y146T0bN',
  'KGEAgIEt6gkQLdV5lSZFvP',
  'KGEAgIEt6gkQLdV5lSZJMo',
  'KGEAgIEt6gkQLdV5lSZKOC',
  'iVn352lnQzrBdeP67CLroJ'
];

(async () => {
  try {
    const query = '*[_type=="post" && _id in $postIds]{_id, title, "writerName": writer->name, "writerSlug": writer->slug.current}';
    const posts = await client.fetch(query, { postIds });
    for (const p of posts) {
      console.log(`- _id: ${p._id} | Title: ${p.title} | Writer: ${p.writerName} (${p.writerSlug})`);
    }
  } catch (e) {
    console.error('Failed to verify writer assignments:', e);
    process.exit(1);
  }
})();
