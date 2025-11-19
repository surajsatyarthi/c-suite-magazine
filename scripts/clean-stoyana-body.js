#!/usr/bin/env node
// Script to clean RTF artifacts and deduplicate lines within the body blocks of Stoyana Natseva's post

const { createClient } = require('@sanity/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function main() {
  const slug = 'stoyana-natseva';
  const query = `*[_type == "post" && slug.current == $slug][0] { _id, body }`;
  const post = await client.fetch(query, { slug });

  if (!post) {
    console.log(`Post with slug "${slug}" not found.`);
    return;
  }

  const rtfPattern = /rtf1ansiansicpg1252cocoartf2761/i;

  let changed = false;
  const cleanedBody = (post.body || []).map(block => {
    if (block._type !== 'block' || !block.children) return block;

    const cleanedChildren = block.children.map(child => {
      if (child._type !== 'span' || !child.text) return child;

      let text = child.text;

      // Remove RTF artifact
      text = text.replace(rtfPattern, '').replace(/\s+/g, ' ').trim();

      // Deduplicate repeated sentences
      const parts = text.split(/\n+/).map(p => p.trim()).filter(Boolean);
      const uniqueParts = [];
      const seen = new Set();
      for (const part of parts) {
        const norm = part.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!seen.has(norm)) {
          seen.add(norm);
          uniqueParts.push(part);
        }
      }
      const cleanedText = uniqueParts.join('\n').trim();

      if (cleanedText !== child.text.trim()) changed = true;
      return { ...child, text: cleanedText };
    }).filter(child => child.text && child.text.trim()); // Remove empty spans

    return { ...block, children: cleanedChildren };
  }).filter(block => block.children && block.children.length > 0); // Remove empty blocks

  if (!changed) {
    console.log('No changes needed for body.');
    return;
  }

  try {
    await client.patch(post._id).set({ body: cleanedBody }).commit();
    console.log(`Cleaned body for post "${slug}".`);
  } catch (e) {
    console.error('Failed to update post:', e.message);
  }
}

main().catch((e) => {
  console.error('Cleaning failed:', e);
  process.exit(1);
});