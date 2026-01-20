require('dotenv').config({path: '.env.local'});
import { getClient } from '../lib/sanity';

// Use write-enabled client
const client = getClient(process.env.SANITY_WRITE_TOKEN);

/**
 * Week 1, Day 1: Remove stopword tags from all articles
 * 
 * CRITICAL: Run backup-before-tag-cleanup.sh BEFORE executing this script
 */

const STOPWORDS = [
  'his', 'her', 'was', 'but', 'she',
  'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'are', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'can', 'its',
  'this', 'that', 'these', 'those', 'i', 'you', 'he', 'it',
  'we', 'they', 'them', 'him', 'not', 'how', 'why', 'when',
  'where', 'what', 'which', 'who'
];

// Also remove problematic short tags
const INVALID_TAGS = ['---', 'gen', 'tan', 'sml', 'm3m', 'dv8', 'art'];

const ALL_REMOVALS = [...STOPWORDS, ...INVALID_TAGS];

async function removeStopwordTags(dryRun: boolean = true) {
  console.log('🔍 Scanning for stopword and invalid tags...\n');
  
  const query = `*[_type == 'post' || _type == 'csa'] {
    _id,
    title,
    tags,
    _type
  }`;
  
  const posts = await client.fetch(query);
  
  let articlesWithStopwords = 0;
  let totalStopwordsRemoved = 0;
  const removalLog: Array<{id: string, title: string, removed: string[]}> = [];
  
  for (const post of posts) {
    if (!Array.isArray(post.tags) || post.tags.length === 0) continue;
    
    const originalTags = post.tags;
    const cleanedTags = originalTags.filter(
      (tag: string) => tag.trim() !== '' && !ALL_REMOVALS.includes(tag.toLowerCase())
    );
    
    if (cleanedTags.length !== originalTags.length) {
      const removed = originalTags.filter(
        (tag: string) => !cleanedTags.includes(tag)
      );
      
      articlesWithStopwords++;
      totalStopwordsRemoved += removed.length;
      
      removalLog.push({
        id: post._id,
        title: post.title,
        removed
      });
      
      if (!dryRun) {
        // Actually update the article
        await client
          .patch(post._id)
          .set({ tags: cleanedTags })
          .commit();
      }
    }
  }
  
  console.log('=== STOPWORD REMOVAL SUMMARY ===\n');
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (no changes)' : '✅ LIVE (changes applied)'}`);
  console.log(`Total articles scanned: ${posts.length}`);
  console.log(`Articles with stopwords: ${articlesWithStopwords}`);
  console.log(`Total stopwords removed: ${totalStopwordsRemoved}\n`);
  
  if (removalLog.length > 0) {
    console.log('=== AFFECTED ARTICLES ===\n');
    removalLog.forEach(({ title, removed }) => {
      console.log(`📄 "${title}"`);
      console.log(`   Removed: ${removed.map(t => `"${t}"`).join(', ')}\n`);
    });
  }
  
  if (dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No changes made');
    console.log('To apply changes, run: npm run tsx scripts/remove-stopword-tags.ts --live\n');
  } else {
    console.log('\n✅ All stopwords removed successfully!\n');
  }
}

// Check command line args
const isLive = process.argv.includes('--live');

removeStopwordTags(!isLive)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
