require('dotenv').config({path: '.env.local'});
import { getClient } from '../lib/sanity';

// Use write-enabled client
const client = getClient(process.env.SANITY_WRITE_TOKEN);

/**
 * Week 3 & 4: Tag Consolidation
 * Executing final mappings to reduce taxonomy noise to target 50-60 tags.
 */

const MAPPINGS: Record<string, string | null> = {
  // 1. Synonym Merging & Broad Categories
  'investment': 'money and finance',
  'investors': 'money and finance',
  'commercial': 'money and finance',
  'retirement': 'money and finance',
  
  'university': 'education',
  'fitness': 'wellness',
  'recovery': 'wellness',
  'sleep': 'wellness',
  'rest': 'wellness',
  'emotional': 'wellness',
  
  'entrepreneurs': 'startups',
  'founder': 'startups',
  
  'leaders': 'leadership',
  'executives': 'leadership',
  'Steve Jobs': 'leadership',
  'team': 'leadership',
  'visionary': 'leadership',
  
  'Future': 'innovation',
  'digital': 'innovation',
  'data': 'innovation',
  'design': 'innovation',
  'concept': 'innovation',
  'infosystems': 'innovation',
  
  'Growth': 'business',
  'growth': 'business',
  'values': 'business',
  'brands': 'business',
  'media': 'business',
  'customer': 'business',
  'product': 'business',

  // 2. Specialized Grouping
  'meat': 'lifestyle',
  'roast': 'lifestyle',
  'sunday': 'lifestyle',
  'culinary': 'lifestyle',
  'dining': 'lifestyle',
  'hospitality': 'lifestyle',
  'travel': 'lifestyle',
  'seine': 'lifestyle',
  'journey': 'lifestyle',
  'cultural': 'lifestyle',
  'chteau': 'lifestyle',
  'experiences': 'lifestyle',
  
  'yachts': 'yachting',
  'vessels': 'yachting',
  'superyacht': 'yachting',
  
  'aviation': 'automotive and logistics',
  'space': 'automotive and logistics',

  'philanthropy': 'changemakers and sustainability',
  'social': 'changemakers and sustainability',
  'water': 'changemakers and sustainability',

  'machine': 'AI',

  // 3. Redundant Metadata & Typo Removal
  'eurofins': null,
  'moffat': null,
  'steel': null,
  'boland': null,
  'mccann': null,
  'pinto': null,
  'croft': null,
  'hanif': null,
  'sepang': null,
  'lottery': null,
  'kearney': null,
  'innerlogic': null,
  'zangardi': null,
  'tanthuwanit': null,
  'peabody': null,
  'isabelle': null,
  'karisma': null,
  'kgari': null,
  'brianne': null,
  'bryan': null,
  'fealk': null,
  'borketey': null,
  'supreet': null,
  'garg': null,
  'bjarklev': null,
  'while': null,
  'than': null,
  'india': null,
  'bhakti': null,
  'hong': null,
  'denysiuk': null,
  'olga': null,
  'krueger': null,
  'riley': null,
  'john': null,
};

async function consolidateTags(dryRun: boolean = true) {
  console.log('🔄 Starting Final Tag Consolidation Pass...\n');
  
  const query = `*[_type in ["post", "csa"] && defined(tags)] {
    _id,
    title,
    tags
  }`;
  
  const documents = await client.fetch(query);
  let updatedCount = 0;
  
  for (const doc of documents) {
    const originalTags: string[] = doc.tags;
    let hasChanges = false;
    
    // Map or remove tags
    const newTags = originalTags.map(tag => {
      const normalized = tag.trim();
      if (MAPPINGS.hasOwnProperty(normalized)) {
        hasChanges = true;
        return MAPPINGS[normalized];
      }
      return tag;
    }).filter((tag): tag is string => tag !== null && tag.trim() !== '');

    // Deduplicate in case a mapping caused a collision
    const deduplicatedTags = Array.from(new Set(newTags));
    if (deduplicatedTags.length !== originalTags.length) hasChanges = true;

    if (hasChanges) {
      updatedCount++;
      console.log(`📄 "${doc.title}"`);
      console.log(`   From: [${originalTags.join(', ')}]`);
      console.log(`   To:   [${deduplicatedTags.join(', ')}]\n`);
      
      if (!dryRun) {
        await client.patch(doc._id).set({ tags: deduplicatedTags }).commit();
      }
    }
  }

  console.log('=== CONSOLIDATION SUMMARY ===\n');
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (no changes)' : '✅ LIVE (changes applied)'}`);
  console.log(`Total documents scanned: ${documents.length}`);
  console.log(`Documents to be updated: ${updatedCount}\n`);

  if (dryRun) {
    console.log('To apply changes, run: npx tsx scripts/consolidate-tags.ts --live');
  } else {
    console.log('✅ Consolidation complete!');
  }
}

const isLive = process.argv.includes('--live');
consolidateTags(!isLive).catch(console.error);
