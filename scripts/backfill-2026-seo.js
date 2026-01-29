const { createClient } = require('@sanity/client');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// CONFIGURATION
const DRY_RUN = process.env.DRY_RUN !== 'false'; // Default to true for safety
const BATCH_SIZE = 10;

/**
 * Helper to convert Portable Text to plain text
 */
function toPlainText(blocks = []) {
  return blocks
    .map(block => {
      if (block._type !== 'block' || !block.children) {
        return '';
      }
      return block.children.map(child => child.text).join('');
    })
    .join('\n\n');
}

/**
 * Professional Truncation (Avoid cutting words in half)
 */
function smartTruncate(text, limit) {
  if (!text || text.length <= limit) return text;
  const sub = text.substring(0, limit);
  const lastSpace = sub.lastIndexOf(' ');
  return (lastSpace > 0 ? sub.substring(0, lastSpace) : sub) + '...';
}

async function runBackfill() {
  console.log(`🚀 Starting SEO Backfill (DRY_RUN: ${DRY_RUN})`);
  
  const query = `*[_type in ["post", "csa"] && isHidden != true] {
    _id,
    _type,
    title,
    body,
    excerpt,
    "currentMetaDescription": seo.metaDescription,
    "currentAlt": mainImage.alt
  }`;

  try {
    const articles = await client.fetch(query);
    console.log(`Total items to process: ${articles.length}\n`);

    let transaction = client.transaction();
    let count = 0;
    let totalUpdated = 0;

    for (const art of articles) {
      const plainBody = toPlainText(art.body);
      if (!plainBody) continue;

      const newExcerpt = art.excerpt || smartTruncate(plainBody, 200);
      const newMetaDesc = art.currentMetaDescription || smartTruncate(plainBody, 155);
      const newAlt = art.currentAlt || art.title;

      const needsUpdate = 
        art.excerpt !== newExcerpt || 
        art.currentMetaDescription !== newMetaDesc || 
        art.currentAlt !== newAlt;

      if (needsUpdate) {
        if (DRY_RUN) {
          console.log(`[DRY RUN] Would update: ${art.title}`);
          if (art.excerpt !== newExcerpt) console.log(`  -> Excerpt: ${newExcerpt.substring(0, 50)}...`);
          if (art.currentMetaDescription !== newMetaDesc) console.log(`  -> SEO Desc: ${newMetaDesc.substring(0, 50)}...`);
          if (art.currentAlt !== newAlt) console.log(`  -> Alt Text: ${newAlt}`);
          console.log('');
        } else {
          transaction.patch(art._id, p => p.set({
            excerpt: newExcerpt,
            'seo.metaDescription': newMetaDesc,
            'mainImage.alt': newAlt
          }));
          count++;
          totalUpdated++;

          if (count >= BATCH_SIZE) {
            await transaction.commit();
            console.log(`✅ Committed batch of ${count} updates. Total: ${totalUpdated}`);
            transaction = client.transaction();
            count = 0;
          }
        }
      }
    }

    if (!DRY_RUN && count > 0) {
      await transaction.commit();
      console.log(`✅ Committed final batch of ${count} updates. Total: ${totalUpdated}`);
    }

    console.log(`\n🎉 Backfill Complete. Total updated: ${totalUpdated}`);

  } catch (err) {
    console.error('❌ Backfill failed:', err.message);
  }
}

runBackfill();
