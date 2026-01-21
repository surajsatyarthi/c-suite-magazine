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

// Ad image configurations with metadata
const adImages = [
    {
        filename: 'LT-Hydrocarbon_Full-Screen-Advert_1536x2048-768x1024-1.jpg',
        title: 'LT Hydrocarbon - Engineering Excellence',
        alt: 'LT Hydrocarbon Full-Screen Advert',
        description: 'LT Hydrocarbon engineering services advertisement',
        advertiser: 'LT Hydrocarbon',
        type: 'full-screen'
    },
    {
        filename: 'Technip-India_REV_In-Content-Advert_1296x880-1024x695-1.jpg',
        title: 'Technip India - Project Solutions',
        alt: 'Technip India In-Content Advert',
        description: 'Technip India engineering and construction services',
        advertiser: 'Technip India',
        type: 'in-content'
    },
    {
        filename: 'Isgec_In-Content-Advert_1536x2048-768x1024-1.jpg',
        title: 'Isgec - Industrial Equipment',
        alt: 'Isgec In-Content Advert',
        description: 'Isgec industrial equipment and solutions',
        advertiser: 'Isgec',
        type: 'in-content'
    },
    {
        filename: 'Sud-Chemie-India_In-Content-Advert_1296x880-1024x695-1.jpg',
        title: 'Sud-Chemie India - Catalyst Solutions',
        alt: 'Sud-Chemie India In-Content Advert',
        description: 'Sud-Chemie India catalysts and chemical processes',
        advertiser: 'Sud-Chemie India',
        type: 'in-content'
    },
    {
        filename: 'Grace-Products_In-Content-Advert_1296x880-1024x695-1.jpg',
        title: 'Grace Products - Specialty Chemicals',
        alt: 'Grace Products In-Content Advert',
        description: 'Grace Products specialty chemicals and materials',
        advertiser: 'Grace Products',
        type: 'in-content'
    }
];

async function uploadAdImages() {
    console.log('📤 Uploading Ad Images to Sanity\n');

    const uploadedImages: any[] = [];

    for (const ad of adImages) {
        try {
            const imagePath = path.join(__dirname, '../public/images/ads', ad.filename);
            
            console.log(`📷 Uploading ${ad.advertiser}...`);
            
            // Check if file exists
            if (!fs.existsSync(imagePath)) {
                console.error(`❌ File not found: ${imagePath}`);
                continue;
            }

            // Upload image to Sanity
            const imageAsset = await client.assets.upload('image', fs.createReadStream(imagePath), {
                filename: ad.filename,
                title: ad.title,
                description: ad.description,
            });

            console.log(`   ✅ Uploaded: ${imageAsset._id}`);

            uploadedImages.push({
                ...ad,
                assetId: imageAsset._id,
                assetRef: imageAsset._id,
                url: imageAsset.url
            });

        } catch (error) {
            console.error(`❌ Error uploading ${ad.advertiser}:`, error);
        }
    }

    console.log(`\n✅ Successfully uploaded ${uploadedImages.length} out of ${adImages.length} images\n`);

    // Save asset IDs for reference
    const outputPath = path.join(__dirname, 'uploaded-ad-assets.json');
    fs.writeFileSync(outputPath, JSON.stringify(uploadedImages, null, 2));
    console.log(`📝 Saved asset references to: ${outputPath}\n`);

    return uploadedImages;
}

async function insertAdsIntoArticle(uploadedImages: any[]) {
    console.log('📝 Inserting Ads into Indian Oil Article\n');

    const articleId = 'l1PaX4hS53uLi0tV4V3Bog';

    try {
        // Fetch the current article
        const article = await client.getDocument(articleId);

        if (!article) {
            console.error('❌ Article not found!');
            return;
        }

        console.log(`✅ Found article: "${(article as any).title}"\n`);

        const content = (article as any).content || [];

        // Helper function to create an image block
        const createImageBlock = (imageData: any) => ({
            _type: 'image',
            _key: `ad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            asset: {
                _type: 'reference',
                _ref: imageData.assetId
            },
            alt: imageData.alt,
            caption: `Advertisement: ${imageData.advertiser}`
        });

        // Find strategic insertion points based on content
        // We'll search for specific heading or paragraph markers

        // Strategy: Insert ads after specific paragraphs
        // 1. LT Hydrocarbon after petrochemical intensity paragraph
        // 2. Technip India after hydrogen section
        // 3. Isgec after logistics/infrastructure section  
        // 4. Sud-Chemie after technical superiority section
        // 5. Grace Products after operational excellence section

        const ltHydrocarbon = uploadedImages.find(img => img.advertiser === 'LT Hydrocarbon');
        const technipIndia = uploadedImages.find(img => img.advertiser === 'Technip India');
        const isgec = uploadedImages.find(img => img.advertiser === 'Isgec');
        const sudChemie = uploadedImages.find(img => img.advertiser === 'Sud-Chemie India');
        const graceProducts = uploadedImages.find(img => img.advertiser === 'Grace Products');

        // Create new content array with ads inserted
        const newContent = [...content];

        // Find insertion points by searching for text markers
        let insertionsMade = 0;

        // Search through blocks to find appropriate insertion points
        for (let i = 0; i < newContent.length; i++) {
            const block = newContent[i];
            
            if (block._type === 'block' && block.children) {
                const text = block.children.map((c: any) => c.text).join('').toLowerCase();

                // 1. Insert LT Hydrocarbon after petrochemical intensity content
                if (text.includes('increasing the profitability of indianoil') && ltHydrocarbon) {
                    newContent.splice(i + 1, 0, createImageBlock(ltHydrocarbon));
                    console.log(`   ✅ Inserted LT Hydrocarbon ad at position ${i + 1}`);
                    insertionsMade++;
                    i++; // Skip the inserted block
                }

                // 2. Insert Technip India after hydrogen export hub content
                if (text.includes('capitalize on the opportunities ahead') && technipIndia) {
                    newContent.splice(i + 1, 0, createImageBlock(technipIndia));
                    console.log(`   ✅ Inserted Technip India ad at position ${i + 1}`);
                    insertionsMade++;
                    i++;
                }

                // 3. Insert Isgec after infrastructure/logistics content
                if (text.includes('we can rely on, and we are always there') && isgec) {
                    newContent.splice(i + 1, 0, createImageBlock(isgec));
                    console.log(`   ✅ Inserted Isgec ad at position ${i + 1}`);
                    insertionsMade++;
                    i++;
                }

                // 4. Insert Sud-Chemie after technical superiority content
                if (text.includes('we are probably among the best in the world') && sudChemie) {
                    newContent.splice(i + 1, 0, createImageBlock(sudChemie));
                    console.log(`   ✅ Inserted Sud-Chemie India ad at position ${i + 1}`);
                    insertionsMade++;
                    i++;
                }

                // 5. Insert Grace Products after operational excellence content
                if (text.includes('most efficient company in terms of product placement') && graceProducts) {
                    newContent.splice(i + 1, 0, createImageBlock(graceProducts));
                    console.log(`   ✅ Inserted Grace Products ad at position ${i + 1}`);
                    insertionsMade++;
                    i++;
                }
            }
        }

        console.log(`\n📊 Total ads inserted: ${insertionsMade}\n`);

        // Update the article with new content
        console.log('💾 Updating article in Sanity...');
        await client
            .patch(articleId)
            .set({ content: newContent })
            .commit();

        console.log('✅ Article updated successfully!\n');
        console.log(`🔗 View article: https://csuitemagazine.global/csa/shrikant-vaidya-chairman-indianoil\n`);

    } catch (error) {
        console.error('❌ Error inserting ads:', error);
        throw error;
    }
}

async function main() {
    try {
        // Step 1: Upload images
        const uploadedImages = await uploadAdImages();

        if (uploadedImages.length === 0) {
            console.error('❌ No images were uploaded. Aborting article update.');
            process.exit(1);
        }

        // Step 2: Insert ads into article
        await insertAdsIntoArticle(uploadedImages);

        console.log('🎉 All done! Ad integration complete.\n');

    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

main();
