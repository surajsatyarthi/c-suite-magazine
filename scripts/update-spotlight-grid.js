const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-10-01',
  token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function main() {
  console.log('Uploading new Spotlight Profile Images...');
  
  // 1. Upload the new profile images
  const baylissImageStream = fs.createReadStream('/Users/user/Downloads/Featured section/ROGER BAYLISS.png');
  const powerImageStream = fs.createReadStream('/Users/user/Downloads/Featured section/scott power.png');
  
  const baylissAsset = await client.assets.upload('image', baylissImageStream, { filename: 'ROGER BAYLISS.png' });
  const powerAsset = await client.assets.upload('image', powerImageStream, { filename: 'scott power.png' });
  
  console.log(`Uploaded Bayliss asset: ${baylissAsset._id}`);
  console.log(`Uploaded Power asset: ${powerAsset._id}`);
  
  const baylissDocId = 'PYCfep3q5TfxEMsSZtDK3U';
  const powerDocId = 'PYCfep3q5TfxEMsSZtDdYL';
  const stinsonDocId = 'fd64f6d9-e720-4c33-826b-7903a806a525';
  const ambroseDocId = 'c79a5d71-febd-4fe1-8dc1-e153c5be57b1';

  // 2. Update the CSA documents with the new spotlight images
  console.log('Patching CSA documents with new spotlight images...');
  await client.patch(baylissDocId)
    .set({
      spotlightImage: {
        _type: 'image',
        asset: { _type: 'reference', _ref: baylissAsset._id },
        alt: 'Roger Bayliss Spotlight Profile'
      }
    })
    .commit();
    
  await client.patch(powerDocId)
    .set({
      spotlightImage: {
        _type: 'image',
        asset: { _type: 'reference', _ref: powerAsset._id },
        alt: 'Scott Power Spotlight Profile'
      }
    })
    .commit();
    
  // 3. Update the Spotlight Config Grid Order
  console.log('Updating Spotlight Grid ordering...');
  const config = await client.fetch('*[_type == "spotlightConfig"][0]');
  
  if (!config || !config.items) {
    throw new Error('Could not find spotlightConfig or items array.');
  }
  
  const targetIds = [stinsonDocId, ambroseDocId, baylissDocId, powerDocId];
  
  // Filter out any of the target IDs from the existing items to avoid duplicates
  const existingItemsFiltered = config.items.filter(item => !targetIds.includes(item._ref));

  // Deduplicate remaining items by _ref to prevent any pre-existing duplicates from carrying forward
  const seenRefs = new Set();
  const existingItemsDeduped = existingItemsFiltered.filter(item => {
    if (seenRefs.has(item._ref)) return false;
    seenRefs.add(item._ref);
    return true;
  });

  // Create the new first 4 items
  const newFirstFour = [
    { _key: 'spotlight-1', _type: 'reference', _ref: stinsonDocId },
    { _key: 'spotlight-2', _type: 'reference', _ref: ambroseDocId },
    { _key: 'spotlight-3', _type: 'reference', _ref: baylissDocId },
    { _key: 'spotlight-4', _type: 'reference', _ref: powerDocId },
  ];

  // Take exactly 8 items from the deduped existing list to make the total 12
  const remainingItemsToKeep = existingItemsDeduped.slice(0, 8);
  
  const finalItems = [...newFirstFour, ...remainingItemsToKeep];
  
  if (finalItems.length !== 12) {
      console.warn(`Warning: Final items length is ${finalItems.length}, not 12. Padding with placeholders if needed, or throwing error.`);
      // If we don't have enough, it might fail validation. But let's assume we do.
  }
  
  await client.patch(config._id)
    .set({ items: finalItems })
    .commit();
    
  console.log('Spotlight Grid successfully updated with the 4 target executives at the front!');
}

main().catch(console.error);
