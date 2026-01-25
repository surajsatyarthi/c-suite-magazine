const { createClient } = require('@sanity/client');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
});

async function checkSpotlightConfigImages() {
  console.log('🔍 Checking Images for Spotlight Config Items...\n');

  try {
    const config = await client.fetch(
      `*[_type == "spotlightConfig"] | order(_updatedAt desc)[0]{
        items[]->{
          title,
          _type,
          "hasSpotlightImage": defined(spotlightImage),
          "spotlightAsset": spotlightImage.asset._ref,
          "hasMainImage": defined(mainImage)
        }
      }`
    );

    if (!config || !config.items) {
      console.log('❌ No spotlight config found.');
      return;
    }

    console.log(`Found ${config.items.length} items. Status:`);
    console.log('----------------------------------------------------');
    
    let rawCount = 0;

    config.items.forEach((item, idx) => {
      if (!item) {
        console.log(`${idx + 1}. [NULL ITEM]`);
        return;
      }
      
      const hasOverlay = item.hasSpotlightImage;
      console.log(`${idx + 1}. [${item.title}] (${item._type})`);
      console.log(`   Overlay (Spotlight): ${hasOverlay ? '✅ PRESENT' : '❌ MISSING (Using Raw)'}`);
      if (!hasOverlay) rawCount++;
      console.log('');
    });

    console.log('----------------------------------------------------');
    console.log(`Summary: ${rawCount} items are rendering raw images (missing overlay).`);
    console.log(`         ${config.items.length - rawCount} items have overlays.`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSpotlightConfigImages();
