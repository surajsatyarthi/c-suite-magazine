require('dotenv').config({path: '.env.local'});
import { getClient } from '../lib/sanity';

// Use write-enabled client
const client = getClient(process.env.SANITY_WRITE_TOKEN);


/**
 * Week 1, Day 2: Normalize tag case inconsistencies
 * 
 * CRITICAL: Run AFTER stopword removal is complete
 */

const CASE_MAPPINGS: Record<string, string> = {
  // Lowercase normalization (majority rule)
  'Opinion': 'opinion',
  'CxO Interview': 'cxo interview',
  'Innovation': 'innovation',
  'Leadership': 'leadership',
  
  // Uppercase for industry-standard acronyms
  'ai': 'AI',
  'esg': 'ESG',
  'cfo': 'CFO',
  'ceo': 'CEO',
  'cto': 'CTO',
  'coo': 'COO',
  'cmo': 'CMO',
  'cio': 'CIO',
  'bfsi': 'BFSI',
  'it': 'IT',
};

async function normalizeTagCase(dryRun: boolean = true) {
  console.log('🔍 Scanning for case inconsistencies...\n');
  
  const query = `*[_type == 'post' || _type == 'csa'] {
    _id,
    title,
    tags,
    _type
  }`;
  
  const posts = await client.fetch(query);
  
  let articlesUpdated = 0;
  let totalTagsNormalized = 0;
  const updateLog: Array<{id: string, title: string, changes: Array<{from: string, to: string}>}> = [];
  
  for (const post of posts) {
    if (!Array.isArray(post.tags) || post.tags.length === 0) continue;
    
    const originalTags = post.tags;
    let hasChanges = false;
    const changes: Array<{from: string, to: string}> = [];
    
    const normalizedTags = originalTags.map((tag: string) => {
      if (CASE_MAPPINGS[tag]) {
        hasChanges = true;
        changes.push({ from: tag, to: CASE_MAPPINGS[tag] });
        totalTagsNormalized++;
        return CASE_MAPPINGS[tag];
      }
      return tag;
    });
    
    if (hasChanges) {
      articlesUpdated++;
      
      updateLog.push({
        id: post._id,
        title: post.title,
        changes
      });
      
      if (!dryRun) {
        // Actually update the article
        await client
          .patch(post._id)
          .set({ tags: normalizedTags })
          .commit();
      }
    }
  }
  
  console.log('=== CASE NORMALIZATION SUMMARY ===\n');
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (no changes)' : '✅ LIVE (changes applied)'}`);
  console.log(`Total articles scanned: ${posts.length}`);
  console.log(`Articles with case issues: ${articlesUpdated}`);
  console.log(`Total tags normalized: ${totalTagsNormalized}\n`);
  
  if (updateLog.length > 0) {
    console.log('=== NORMALIZATION CHANGES ===\n');
    updateLog.forEach(({ title, changes }) => {
      console.log(`📄 "${title}"`);
      changes.forEach(({ from, to }) => {
        console.log(`   "${from}" → "${to}"`);
      });
      console.log('');
    });
  }
  
  if (dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No changes made');
    console.log('To apply changes, run: npx tsx scripts/normalize-tag-case.ts --live\n');
  } else {
    console.log('\n✅ All tags normalized successfully!\n');
  }
}

// Check command line args
const isLive = process.argv.includes('--live');

normalizeTagCase(!isLive)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
