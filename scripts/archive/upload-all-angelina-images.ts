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

async function uploadSpotlightImages() {
    console.log('🖼️  Uploading Spotlight and Main Images for Angelina Article\n');

    const angelinaId = 'Xj1aOvHL2Hs0lhtupB0F2K';

    // Paths to images
    const heroImagePath = path.join(__dirname, '../public/Featured hero/Angelina Usanova.webp');
    const sectionImagePath = path.join(__dirname, '../public/Featured section/Angelina Usanova.png');

    try {
        const article = await client.fetch(`*[_id == $id][0] {
            _id,
            title,
            heroImage,
            mainImage,
            spotlightImage
        }`, { id: angelinaId });

        if (!article) {
            console.error('❌ Article not found');
            return;
        }

        console.log('Current article state:');
        console.log(`   heroImage: ${article.heroImage ? '✅ Present' : '❌ Missing'}`);
        console.log(`   mainImage: ${article.mainImage ? '✅ Present' : '❌ Missing'}`);
        console.log(`   spotlightImage: ${article.spotlightImage ? '✅ Present' : '❌ Missing'}\n`);

        let heroAsset = null;
        let sectionAsset = null;

        // Upload hero image if exists and not already uploaded
        if (fs.existsSync(heroImagePath)) {
            if (!article.heroImage) {
                console.log('Uploading hero image...');
                heroAsset = await client.assets.upload('image', fs.createReadStream(heroImagePath), {
                    filename: 'angelina-usanova-hero.webp',
                });
                console.log(`✅ Hero image uploaded: ${heroAsset._id}\n`);
            } else {
                console.log('✅ Hero image already present\n');
            }
        }

        // Upload section image for mainImage/spotlightImage
        if (fs.existsSync(sectionImagePath)) {
            console.log('Uploading section/spotlight image...');
            sectionAsset = await client.assets.upload('image', fs.createReadStream(sectionImagePath), {
                filename: 'angelina-usanova-spotlight.png',
            });
            console.log(`✅ Section image uploaded: ${sectionAsset._id}\n`);
        }

        // Build update object
        const updates: any = {};

        if (heroAsset && !article.heroImage) {
            updates.heroImage = {
                _type: 'image',
                asset: {
                    _type: 'reference',
                    _ref: heroAsset._id,
                },
            };
        }

        if (sectionAsset) {
            const imageRef = {
                _type: 'image',
                asset: {
                    _type: 'reference',
                    _ref: sectionAsset._id,
                },
            };

            // Set BOTH mainImage and spotlightImage to ensure coverage
            updates.mainImage = imageRef;
            updates.spotlightImage = imageRef;
        }

        if (Object.keys(updates).length > 0) {
            console.log('Updating article with images...');
            await client.patch(angelinaId).set(updates).commit();
            console.log('✅ Article updated!\n');
        }

        // Final verification
        const updatedArticle = await client.fetch(`*[_id == $id][0] {
            _id,
            title,
            heroImage { asset-> { url } },
            mainImage { asset-> { url } },
            spotlightImage { asset-> { url } }
        }`, { id: angelinaId });

        console.log('📊 Final state:');
        console.log(`   heroImage: ${updatedArticle.heroImage ? `✅ ${updatedArticle.heroImage.asset?.url}` : '❌ Missing'}`);
        console.log(`   mainImage: ${updatedArticle.mainImage ? `✅ ${updatedArticle.mainImage.asset?.url}` : '❌ Missing'}`);
        console.log(`   spotlightImage: ${updatedArticle.spotlightImage ? `✅ ${updatedArticle.spotlightImage.asset?.url}` : '❌ Missing'}\n`);

    } catch (error) {
        console.error('Error:', error);
    }
}

uploadSpotlightImages();
