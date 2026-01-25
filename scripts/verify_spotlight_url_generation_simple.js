const { createClient } = require('@sanity/client');
const imageUrlBuilder = require('@sanity/image-url');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Mimic lib/sanity.ts
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
});

const builder = imageUrlBuilder(client);

function urlFor(source) {
  return builder.image(source);
}

async function verifyLogic() {
  console.log('🧪 Verifying Spotlight Logic URL Generation (JS)...\n');

  try {
    // Mimic lib/spotlight.ts query
    const data = await client.fetch(
      `*[_type == "spotlightConfig"] | order(_updatedAt desc)[0]{
        items[]->{ 
            _id, 
            title, 
            mainImage, 
            spotlightImage
        }
      }`
    );

    if (!data || !data.items) {
      console.log('❌ No items found');
      return;
    }

    let failureCount = 0;

    data.items.forEach((p, idx) => {
        if (!p) return;
        
        console.log(`${idx + 1}. [${p.title}]`);
        
        // Exact logic from lib/spotlight.ts
        const chosen = p.spotlightImage || p.mainImage;
        const isSpotlight = !!p.spotlightImage;
        
        console.log(`   Source Logic: ${isSpotlight ? 'spotlightImage' : 'mainImage (Fallback)'}`);
        
        let image = `fallback-${idx}.png`;
        let success = false;
        
        try {
            if (chosen && (chosen.asset || chosen._ref)) {
                image = urlFor(chosen).width(1200).height(1800).url();
                success = true;
            } else {
                console.log('   ⚠️  Chosen image has no asset/ref');
            }
        } catch (e) {
            console.error(`   ❌ Generation Error: ${e.message}`);
        }

        if (success) {
            console.log(`   ✅ URL: ${image}`);
        } else {
            console.log(`   ❌ FAILED to generate URL`);
            failureCount++;
        }
        console.log('');
    });

    if (failureCount > 0) {
        console.log(`❌ FAILED: ${failureCount} items could not generate URLs.`);
    } else {
        console.log(`✅ SUCCESS: All items generated URLs successfully using the app logic.`);
    }

  } catch (e) {
    console.error('❌ Fatal Error:', e.message);
  }
}

verifyLogic();
