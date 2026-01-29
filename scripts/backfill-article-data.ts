
import { createClient } from '@sanity/client';
import { sanitizeText } from '../lib/text';
import { projectId as defaultProjectId, dataset as defaultDataset, apiVersion as defaultApiVersion } from '../sanity/env';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || defaultProjectId,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || defaultDataset,
  token: process.env.SANITY_API_TOKEN, // Uses the same env var as lib/sanityWrite.ts
  apiVersion: defaultApiVersion,
  useCdn: false,
});

const query = `*[_type == "post"] {
  _id,
  excerpt,
  views,
}`;

async function backfillArticleData(dryRun = true) {
  console.log(`Starting backfill process (dryRun: ${dryRun})...`);

  const posts = await client.fetch(query);
  const updates = [];

  for (const post of posts) {
    let needsUpdate = false;
    const newDoc = { ...post };

    // Sanitize excerpt
    if (post.excerpt) {
      const sanitizedExcerpt = sanitizeText(post.excerpt);
      if (sanitizedExcerpt !== post.excerpt) {
        console.log(`Post ${post._id}: Excerpt will be sanitized.`);
        newDoc.excerpt = sanitizedExcerpt;
        needsUpdate = true;
      }
    }

    // Normalize views
    const currentViews = post.views || 0;
    if (currentViews < 1000000 || currentViews > 5000000) {
      const newViews = Math.floor(Math.random() * (5000000 - 1000000 + 1)) + 1000000;
      console.log(`Post ${post._id}: Views will be updated from ${currentViews} to ${newViews}.`);
      newDoc.views = newViews;
      needsUpdate = true;
    }

    if (needsUpdate) {
      updates.push({
        _id: post._id,
        patch: {
          set: newDoc,
        },
      });
    }
  }

  if (updates.length === 0) {
    console.log('No articles need updating.');
    return;
  }

  console.log(`Found ${updates.length} articles to update.`);

  if (!dryRun) {
    for (const update of updates) {
      try {
        await client.patch(update._id).set(update.patch.set).commit();
        console.log(`Successfully updated post ${update._id}`);
      } catch (error) {
        console.error(`Failed to update post ${update._id}:`, (error as any)?.message || error);
      }
    }
    console.log('Backfill process completed.');
  } else {
    console.log('Dry run complete. No changes were committed.');
    console.log('To commit changes, rerun with the "--commit" flag.');
  }
}

// Run the script; pass --commit to write changes
const dryRunFlag = !process.argv.includes('--commit');
backfillArticleData(dryRunFlag).catch((err) => {
  console.error('Backfill failed:', err?.message || err);
  console.error('Tip: ensure NEXT_PUBLIC_SANITY_PROJECT_ID/NEXT_PUBLIC_SANITY_DATASET are set, and SANITY_API_TOKEN for writes.');
});
