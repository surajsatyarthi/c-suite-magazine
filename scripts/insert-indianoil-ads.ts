import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
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

async function insertAdsIntoArticle() {
    console.log('📝 Inserting Ads into Indian Oil Article\n');

    const articleId = 'l1PaX4hS53uLi0tV4V3Bog';

    // Load uploaded ad assets
    const assetsPath = path.join(__dirname, 'uploaded-ad-assets.json');
    const uploadedImages = JSON.parse(fs.readFileSync(assetsPath, 'utf-8'));

    try {
        // Fetch the current article
        const article = await client.getDocument(articleId);

        if (!article) {
            console.error('❌ Article not found!');
            return;
        }

        console.log(`✅ Found article: "${(article as any).title}"\n`);

        const body = (article as any).body || [];
        console.log(`📊 Current body blocks: ${body.length}`);

        if (body.length === 0) {
            console.error('❌ Article body is empty! Cannot insert ads.');
            return;
        }

        // Helper function to create an image block
        const createImageBlock = (imageData: any) => ({
            _type: 'image',
            _key: `ad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            asset: {
                _type: 'reference',
                _ref: imageData.assetId
            },
            alt: imageData.alt,
            caption: imageData.advertiser
        });

        const ltHydrocarbon = uploadedImages.find((img: any) => img.advertiser === 'LT Hydrocarbon');
        const technipIndia = uploadedImages.find((img: any) => img.advertiser === 'Technip India');
        const isgec = uploadedImages.find((img: any) => img.advertiser === 'Isgec');
        const sudChemie = uploadedImages.find((img: any) => img.advertiser === 'Sud-Chemie India');
        const graceProducts = uploadedImages.find((img: any) => img.advertiser === 'Grace Products');

        // Create new body array with ads inserted
        const newBody = [...body];

        let insertionsMade = 0;

        // Search through blocks to find appropriate insertion points
        for (let i = newBody.length - 1; i >= 0; i--) {
            const block = newBody[i];
            
            if (block._type === 'block' && block.children) {
                const text = block.children.map((c: any) => c.text).join('').toLowerCase();

                // 5. Insert Grace Products after "most efficient company in terms of product placement"
                if (text.includes('most efficient company') && text.includes('product placement') && graceProducts) {
                    newBody.splice(i + 1, 0, createImageBlock(graceProducts));
                    console.log(`   ✅ [${insertionsMade + 1}] Inserted Grace Products ad at position ${i + 1}`);
                    insertionsMade++;
                }

                // 4. Insert Sud-Chemie after "probably among the best in the world"
                if (text.includes('probably among the best in the world') && sudChemie) {
                    newBody.splice(i + 1, 0, createImageBlock(sudChemie));
                    console.log(`   ✅ [${insertionsMade + 1}] Inserted Sud-Chemie India ad at position ${i + 1}`);
                    insertionsMade++;
                }

                // 3. Insert Isgec after "we are always there to fulfil our mandate"
                if (text.includes('always there to fulfil our mandate') && isgec) {
                    newBody.splice(i + 1, 0, createImageBlock(isgec));
                    console.log(`   ✅ [${insertionsMade + 1}] Inserted Isgec ad at position ${i + 1}`);
                    insertionsMade++;
                }

                // 2. Insert Technip India after "capitalize on the opportunities ahead"
                if (text.includes('capitalize on the opportunities ahead') && technipIndia) {
                    newBody.splice(i + 1, 0, createImageBlock(technipIndia));
                    console.log(`   ✅ [${insertionsMade + 1}] Inserted Technip India ad at position ${i + 1}`);
                    insertionsMade++;
                }

                // 1. Insert LT Hydrocarbon after petrochemical intensity paragraph
                if (text.includes('increasing the profitability of indianoil') && ltHydrocarbon) {
                    newBody.splice(i + 1, 0, createImageBlock(ltHydrocarbon));
                    console.log(`   ✅ [${insertionsMade + 1}] Inserted LT Hydrocarbon ad at position ${i + 1}`);
                    insertionsMade++;
                }
            }
        }

        console.log(`\n📊 Total ads inserted: ${insertionsMade}\n`);

        if (insertionsMade === 0) {
            console.warn('⚠️  No ads were inserted. Text matching may have failed.');
            console.log('\n📝 Printing first 5 blocks for debugging:\n');
            body.slice(0, 5).forEach((block: any, i: number) => {
                if (block._type === 'block' && block.children) {
                    const text = block.children.map((c: any) => c.text).join('');
                    console.log(`Block ${i}: ${text.substring(0, 100)}...`);
                }
            });
            return;
        }

        // Update the article with new body
        console.log('💾 Updating article in Sanity...');
        await client
            .patch(articleId)
            .set({ body: newBody })
            .commit();

        console.log('✅ Article updated successfully!\n');
        console.log(`🔗 View article: https://csuitemagazine.global/csa/shrikant-vaidya-chairman-indianoil\n`);
        console.log('🎉 Ad integration complete!\n');

    } catch (error) {
        console.error('❌ Error inserting ads:', error);
        throw error;
    }
}

insertAdsIntoArticle();
