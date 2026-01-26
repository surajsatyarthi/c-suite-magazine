const { createClient } = require('@sanity/client');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function runAudit() {
  console.log('Starting SEO Deep Scan...');

  const query = `*[_type in ["post", "csa"] && isHidden != true] {
    _id,
    _type,
    title,
    "slug": slug.current,
    excerpt,
    "hasMetaTitle": defined(seo.metaTitle),
    "hasMetaDescription": defined(seo.metaDescription),
    "hasExcerpt": defined(excerpt),
    "hasImage": defined(mainImage.asset),
    "hasImageAlt": defined(mainImage.alt),
    "categoryCount": count(categories)
  }`;

  try {
    const articles = await client.fetch(query);
    console.log(`Scanning ${articles.length} articles...\n`);

    const report = {
      total: articles.length,
      missingMetaTitle: [],
      missingMetaDescription: [],
      missingExcerpt: [],
      missingImage: [],
      missingImageAlt: [],
      missingCategory: [],
      perfectScore: []
    };

    articles.forEach(art => {
      let perfect = true;

      if (!art.hasMetaTitle) {
        report.missingMetaTitle.push({ title: art.title, slug: art.slug, type: art._type });
        perfect = false;
      }
      if (!art.hasMetaDescription) {
        report.missingMetaDescription.push({ title: art.title, slug: art.slug, type: art._type });
        perfect = false;
      }
      if (!art.hasExcerpt) {
        report.missingExcerpt.push({ title: art.title, slug: art.slug, type: art._type });
        perfect = false;
      }
      if (!art.hasImage) {
        report.missingImage.push({ title: art.title, slug: art.slug, type: art._type });
        perfect = false;
      }
      if (!art.hasImageAlt) {
        report.missingImageAlt.push({ title: art.title, slug: art.slug, type: art._type });
        perfect = false;
      }
      if (art.categoryCount === 0) {
        report.missingCategory.push({ title: art.title, slug: art.slug, type: art._type });
        perfect = false;
      }

      if (perfect) {
        report.perfectScore.push(art.slug);
      }
    });

    // Output summary
    console.log('--- AUDIT SUMMARY ---');
    console.log(`Total Articles: ${report.total}`);
    console.log(`Articles Missing Meta Title: ${report.missingMetaTitle.length}`);
    console.log(`Articles Missing Meta Description: ${report.missingMetaDescription.length}`);
    console.log(`Articles Missing Excerpt: ${report.missingExcerpt.length}`);
    console.log(`Articles Missing Image: ${report.missingImage.length}`);
    console.log(`Articles Missing Image Alt: ${report.missingImageAlt.length}`);
    console.log(`Articles Missing Categories: ${report.missingCategory.length}`);
    console.log(`Articles with 100% SEO Coverage: ${report.perfectScore.length}`);
    console.log('\nWriting full report to artifacts/seo-audit-report.json...');

    const artifactDir = path.resolve(__dirname, '../artifacts');
    if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir);

    fs.writeFileSync(
      path.join(artifactDir, 'seo-audit-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('Done.');

  } catch (error) {
    console.error('Audit failed:', error);
  }
}

runAudit();
