const { createClient } = require('@sanity/client');
require('dotenv').config({ path: './.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const cxoSlugs = [
  'angelina-usanova',
  'olga-denysiuk',
  'stoyana-natseva',
  'brianne-howey',
  'dr-basma-ghandourah',
  'erin-krueger',
  'bill-faruki',
  'pankaj-bansal',
  'supreet-nagi',
  'swami-aniruddha',
  'bryce-tully',
  'cal-riley',
  'john-zangardi',
  'bryan-smeltzer',
  'dean-fealk',
  'benjamin-borketey'
];

(async () => {
  try {
    const query = '*[_type=="post" && writer->slug.current in $cxoSlugs]{_id, title, "slug": slug.current, "writerName": writer->name, "writerSlug": writer->slug.current}';
    const posts = await client.fetch(query, { cxoSlugs });
    for (const p of posts) {
      console.log(`- _id: ${p._id} | Title: ${p.title} | Slug: ${p.slug} | Writer: ${p.writerName} (${p.writerSlug})`);
    }
    if (posts.length === 0) {
      console.log('No posts found for the provided writer slugs.');
    }
  } catch (e) {
    console.error('Failed to list posts for writer slugs:', e);
    process.exit(1);
  }
})();
