import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2023-05-03',
    useCdn: false, // Use the fresh data API, bypassing CDN DNS issues
    token: process.env.SANITY_API_TOKEN,
});

async function auditContent() {
    console.log('--- Starting Content Audit ---');
    
    // 1. Audit Articles for Images and Excerpts
        const articles = await client.fetch(`*[_type in ["post", "csa"] && !(_id in path("drafts.**"))] { 
            _type, 
            title, 
            "slug": slug.current, 
            "hasMainImage": defined(mainImage.asset),
            "mainImageRef": mainImage.asset._ref,
            "hasExcerpt": defined(excerpt) && excerpt != "" 
        }`);

        const totalArticles = articles.length;
        const missingImage = articles.filter((a: any) => !a.hasMainImage);
        const malformedImage = articles.filter((a: any) => a.hasMainImage && a.mainImageRef && !a.mainImageRef.match(/^image-[a-f0-9]{40,}-[0-9]+x[0-9]+-[a-z]+$/));
    const missingExcerpts = articles.filter((a: any) => !a.hasExcerpt);
    
    const posts = articles.filter((a: any) => a._type === "post");
    const csas = articles.filter((a: any) => a._type === "csa");

    console.log(`\n--- CONTENT AUDIT SUMMARY ---`);
    console.log(`Total Articles Analyzed: ${totalArticles} (${posts.length} posts, ${csas.length} CSAs)`);
    console.log(`-----------------------------------`);
    console.log(`BROKEN/MISSING IMAGES: ${missingImage.length + malformedImage.length}`);
    console.log(`MISSING EXCERPTS: ${missingExcerpts.length}`);
    console.log(`-----------------------------------`);

    if (missingImage.length > 0 || malformedImage.length > 0) {
        console.log(`\n❌ Missing Images: ${missingImage.length}`);
        missingImage.forEach((a: any) => console.log(`  - [${a._type}] ${a.title} (${a.slug})`));

        console.log(`\n⚠️ Malformed/Broken References: ${malformedImage.length}`);
        malformedImage.forEach((a: any) => console.log(`  - [${a._type}] ${a.title} (Ref: ${a.mainImageRef}) (${a.slug})`));
    }

    if (missingExcerpts.length > 0) {
        console.log('\nList of Articles Missing Excerpts:');
        missingExcerpts.forEach((a: any) => console.log(`- [${a._type}] ${a.title} (${a.slug})`));
    }

    console.log('\n--- END AUDIT ---');
}

auditContent().catch(err => {
    console.error('Audit failed:', err);
    process.exit(1);
});
