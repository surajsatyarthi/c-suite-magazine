import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createClient } from '@sanity/client';
import { config } from '../sanity/config';

const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

async function checkJuggernautExcerpts() {
    console.log('🔍 Checking Industry Juggernaut Excerpts\n');
    console.log('='.repeat(80));

    const juggernautSlugs = [
        'elon-musk-building-future-civilization-scale',
        'ratan-tata-legacy-ethical-leadership',
        'bhavesh-aggarwal-india-electric-ai-maverick',
        'ritesh-agarwal-billion-dollar-hostel-kid-rewrote-global-hospitality',
        'amin-nasser-steady-hand-guiding-energy-next-chapter',
        'chamath-palihapitiya-spac-king-climate-tech-rebel',
        'yi-he-village-roots-co-ceo-crypto-global-gateway',
        'mohamed-alabbar-dubai-master-builder-urban-innovation',
        'murray-auchincloss-pragmatic-reset-steering-bp-value'
    ];

    console.log('Checking excerpts for all 9 juggernauts...\n');

    const missing = [];
    const present = [];

    for (const slug of juggernautSlugs) {
        const article = await client.fetch(
            `*[_type == "post" && slug.current == $slug][0] { 
                _id,
                title,
                slug,
                excerpt
            }`,
            { slug }
        );

        if (article) {
            if (article.excerpt && article.excerpt.trim().length > 0) {
                present.push(article.title);
                console.log(`✅ ${article.title}`);
                console.log(`   Excerpt: ${article.excerpt.substring(0, 100)}...\n`);
            } else {
                missing.push({ _id: article._id, title: article.title, slug: slug });
                console.log(`❌ ${article.title}`);
                console.log(`   Missing excerpt\n`);
            }
        }
    }

    console.log('='.repeat(80));
    console.log(`\n📊 Summary:\n`);
    console.log(`   ✅ Have excerpts: ${present.length}`);
    console.log(`   ❌ Missing excerpts: ${missing.length}\n`);

    if (missing.length > 0) {
        console.log('Articles needing excerpts:\n');
        missing.forEach((article, i) => {
            console.log(`${i + 1}. ${article.title}`);
            console.log(`   ID: ${article._id}\n`);
        });
    }
}

checkJuggernautExcerpts();
