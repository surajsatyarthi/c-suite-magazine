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

async function checkHeroConfig() {
  console.log('🔍 Checking ExecutiveInFocus (Hero) Config...\n');

  try {
    const hero = await client.fetch(
      `*[_type == "executiveInFocusConfig"][0]{
        "articleTitle": featuredArticle->title,
        "articleType": featuredArticle->_type,
        "hasSpotlightImage": defined(featuredArticle->spotlightImage),
        "spotlightAsset": featuredArticle->spotlightImage.asset._ref,
        "hasMainImage": defined(featuredArticle->mainImage)
      }`
    );

    if (!hero) {
      console.log('❌ No ExecutiveInFocus config found.');
      return;
    }

    console.log(`Hero Article: [${hero.articleTitle}]`);
    console.log(`   Type: ${hero.articleType}`);
    console.log(`   Overlay (Spotlight): ${hero.hasSpotlightImage ? '✅ PRESENT' : '❌ MISSING (Using Raw)'}`);
    
    if (!hero.hasSpotlightImage) {
      console.log('\n⚠️  Hero is missing the overlay image!');
    } else {
      console.log('\n✅ Hero has overlay image.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkHeroConfig();
