#!/usr/bin/env node
// Targeted sanitization for Stoyana Natseva's post: remove RTF artifacts and deduplicate title

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
  const query = `*[_type == "post" && slug.current == $slug][0] { _id, title }`;
  const post = await client.fetch(query, { slug });

  if (!post) {
    console.log(`Post with slug "${slug}" not found.`);
    return;
  }

  const rtfPattern = /\\rtf1\\ansi\\ansicpg1252\\cocoartf2761\s*\\cocoatextscaling0\\cocoaplatform0{\\fonttbl\\f0\\fswiss\\fcharset0 Helvetica;}\\s*{\\colortbl;\\red255\\green255\\blue255;}\\s*{\\*\\expandedcolortbl;;}\\s*\\paperw11900\\paperh16840\\margl1440\\margr1440\\vieww11520\\viewh8400\\viewkind0\\s*\\pard\\tx720\\tx1440\\tx2160\\tx2880\\tx3600\\tx4320\\tx5040\\tx5760\\tx6480\\tx7200\\tx7920\\tx8640\\pardirnatural\\partightenfactor0\\s*\\f0\\fs24 \\cf0 /i;
  let cleanTitle = post.title.replace(rtfPattern, '').trim();

  // Deduplicate if the title appears twice
  const parts = cleanTitle.split(/\s+/).filter(Boolean);
  const mid = Math.floor(parts.length / 2);
  const firstHalf = parts.slice(0, mid).join(' ');
  const secondHalf = parts.slice(mid).join(' ');
  if (firstHalf === secondHalf) {
    cleanTitle = firstHalf;
  }

  if (cleanTitle === post.title) {
    console.log('No changes needed for title.');
    return;
  }

  try {
    await client.patch(post._id).set({ title: cleanTitle }).commit();
    console.log(`Updated title for post "${slug}": "${cleanTitle}"`);
  } catch (e) {
    console.error('Failed to update post:', e.message);
  }
}

main().catch((e) => {
  console.error('Sanitization failed:', e);
  process.exit(1);
});