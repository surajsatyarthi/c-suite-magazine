const { createClient } = require('@sanity/client');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false, // We want fresh data
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
});

async function checkWidgetData() {
  console.log('🔍 Checking SpotlightsWidget Data Consistency...\n');

  // The query used in SpotlightsWidget.tsx (augmented to check spotlightImage)
  const query = `*[_type == "post" 
    && "cxo-interview" in categories[]->slug.current
    && defined(mainImage)
  ] | order(publishedAt desc)[0...10] {
    title,
    slug,
    "hasSpotlightImage": defined(spotlightImage),
    "spotlightImageRef": spotlightImage.asset._ref,
    "hasMainImage": defined(mainImage),
    "mainImageRef": mainImage.asset._ref
  }`;

  try {
    const articles = await client.fetch(query);
    
    console.log(`Found ${articles.length} recent CXO Interview articles:`);
    console.log('----------------------------------------------------');
    
    let missingSpotlightCount = 0;

    articles.forEach((article, idx) => {
      console.log(`${idx + 1}. [${article.title}]`);
      console.log(`   Slug: ${article.slug.current}`);
      if (article.hasSpotlightImage) {
        console.log(`   ✅ spotlightImage: PRESENT (${article.spotlightImageRef})`);
      } else {
        console.log(`   ❌ spotlightImage: MISSING`);
        missingSpotlightCount++;
      }
      console.log(`   ℹ️  mainImage: ${article.hasMainImage ? 'Present' : 'Missing'}`);
      console.log('');
    });

    console.log('----------------------------------------------------');
    if (missingSpotlightCount > 0) {
      console.log(`⚠️  CONCLUSION: ${missingSpotlightCount}/${articles.length} articles are missing the 'spotlightImage' field.`);
      console.log(`   The frontend 'SpotlightsWidget.tsx' IS NOT QUERYING THIS FIELD either.`);
      console.log(`   Fix requires: 1) Uploading images (Data), 2) Updating Component Query (Code).`);
    } else {
      console.log(`✅ CONCLUSION: All articles have 'spotlightImage'. The issue is likely just the frontend query.`);
    }

  } catch (error) {
    console.error('❌ Error fetching data:', error.message);
  }
}

checkWidgetData();
