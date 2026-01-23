const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

async function runDeepAudit() {
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    useCdn: false,
    apiVersion: '2023-05-03',
    token: process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN
  });

  console.log('🕵️  Starting Deep Content Audit...\n');

  try {
    // 1. Audit Categories
    console.log('--- Categories & Usage ---');
    const categories = await client.fetch(`*[_type == "category"]{title, "slug": slug.current, "count": count(*[_type in ["post", "csa"] && references(^._id)])}`);
    categories.forEach(c => {
      console.log(`[${c.count > 0 ? 'LIVE' : 'GHOST'}] ${c.title} (${c.slug}): ${c.count} articles`);
    });

    // 2. Audit Archives
    console.log('\n--- Archive Image Gaps ---');
    const missingImages = await client.fetch(`*[_type in ["post", "csa"] && !defined(mainImage.asset)]{title, "slug": slug.current, _type}`);
    console.log(`Found ${missingImages.length} articles with MISSING main images.`);
    missingImages.slice(0, 20).forEach(m => console.log(` - [${m._type}] ${m.title} (${m.slug})`));

    // 3. Audit Tags
    console.log('\n--- Tag Health ---');
    const tags = await client.fetch(`*[_type == "tag"]{name, "slug": slug.current, "count": count(*[_type in ["post", "csa"] && references(^._id)])}`);
    const ghostTags = tags.filter(t => t.count === 0);
    console.log(`Found ${ghostTags.length} tags with 0 associated articles.`);
    
    // 4. Specific Footer Link Audit
    console.log('\n--- Footer Link Verification ---');
    const targetSlugs = ['leadership', 'money-and-finance', 'science-technology', 'cxo-interview'];
    for (const slug of targetSlugs) {
      const count = await client.fetch(`count(*[_type in ["post", "csa"] && references(*[_type == "category" && slug.current == $slug]._id)])`, { slug });
      console.log(`Footer Link [/category/${slug}]: ${count > 0 ? 'VALID' : '🚨 GHOST LINK (0 articles)'}`);
    }

  } catch (err) {
    console.error('Audit failed:', err.message);
  }
}

runDeepAudit();
