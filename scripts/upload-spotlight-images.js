const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

// Mapping of image filenames to article title search terms
const imageMapping = [
  { file: 'Bill Faruki.png', searchTerm: 'Bill Faruki' },
  { file: 'Brianne Howey.png', searchTerm: 'Brianne Howey' },
  { file: 'stoyana natseva.png', searchTerm: 'Stoyana Natseva' },
  { file: 'dr. basma ghandourah.png', searchTerm: 'Basma Ghandourah' },
  { file: 'Erin Krueger.png', searchTerm: 'Erin Krueger' },
  { file: 'Pankaj Bansal.png', searchTerm: 'Pankaj Bansal' },
  { file: 'Supreet Nagi.png', searchTerm: 'Supreet Nagi' },
  { file: 'Swami Aniruddha.png', searchTerm: 'Swami Aniruddha' },
  { file: 'bryce tully.png', searchTerm: 'Bryce Tully' },
  { file: 'cal riley.png', searchTerm: 'Cal Riley' },
  { file: 'Olga Denysiuk.png', searchTerm: 'Olga Denysiuk' },
];

const FEATURED_SECTION_DIR = path.join(__dirname, '../public/Featured section');

async function uploadSpotlightImages() {
  console.log('🚀 Starting spotlight image upload...\n');
  
  let successCount = 0;
  let failCount = 0;

  for (const mapping of imageMapping) {
    try {
      console.log(`\n📸 Processing: ${mapping.file}`);
      
      // 1. Find the article
      const query = `*[_type == "post" && title match "${mapping.searchTerm}*"][0]{ _id, title, spotlightImage }`;
      const article = await client.fetch(query);
      
      if (!article) {
        console.log(`   ❌ Article not found for: ${mapping.searchTerm}`);
        failCount++;
        continue;
      }
      
      console.log(`   ✓ Found article: ${article.title}`);
      
      // 2. Check if spotlightImage already exists
      if (article.spotlightImage?.asset) {
        console.log(`   ⚠️  Article already has spotlight image, skipping...`);
        continue;
      }
      
      // 3. Read the image file
      const imagePath = path.join(FEATURED_SECTION_DIR, mapping.file);
      if (!fs.existsSync(imagePath)) {
        console.log(`   ❌ Image file not found: ${imagePath}`);
        failCount++;
        continue;
      }
      
      const imageBuffer = fs.readFileSync(imagePath);
      console.log(`   ✓ Read image file (${(imageBuffer.length / 1024).toFixed(2)} KB)`);
      
      // 4. Upload image to Sanity
      console.log(`   ⬆️  Uploading to Sanity...`);
      const uploadedAsset = await client.assets.upload('image', imageBuffer, {
        filename: mapping.file,
      });
      
      console.log(`   ✓ Uploaded asset: ${uploadedAsset._id}`);
      
      // 5. Update article with the new spotlightImage
      await client
        .patch(article._id)
        .set({
          spotlightImage: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: uploadedAsset._id,
            },
            alt: `${mapping.searchTerm} - C-Suite Magazine Spotlight`,
          },
        })
        .commit();
      
      console.log(`   ✅ SUCCESS: Updated ${article.title}`);
      successCount++;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`   ❌ ERROR processing ${mapping.file}:`, error.message);
      failCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Upload Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📝 Total: ${imageMapping.length}`);
  console.log('\n' + '='.repeat(60));
}

uploadSpotlightImages().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
