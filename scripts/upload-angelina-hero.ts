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

async function uploadAngelinaHeroImage() {
    console.log('🖼️  Uploading Hero Image for Angelina Usanova Article\n');

    const articleId = 'Xj1aOvHL2Hs0lhtupB0F2K'; // The correct "Anchored in America" article

    // Find the article
    const article = await client.fetch(`
        *[_id == $id][0] {
            _id,
            _type,
            title,
            slug,
            heroImage,
            "categories": categories[]->title
        }
    `, { id: articleId });

    if (!article) {
        console.error('❌ Article not found with ID:', articleId);
        return;
    }

    console.log('✅ Found article:');
    console.log(`   Title: ${article.title}`);
    console.log(`   Type: ${article._type}`);
    console.log(`   ID: ${article._id}`);
    console.log(`   Current Hero Image: ${article.heroImage ? '✅ Present' : '❌ Missing'}\n`);

    // Check if hero image already exists
    if (article.heroImage) {
        console.log('ℹ️  Article already has a hero image. Current image reference:');
        console.log(JSON.stringify(article.heroImage, null, 2));
        console.log('\n⚠️  Would you like to replace it? (This script will upload and update)\n');
    }

    // Path to the hero image
    const imagePath = path.join(__dirname, '../public/Featured hero/Angelina Usanova.webp');

    if (!fs.existsSync(imagePath)) {
        console.error(`❌ Image file not found at: ${imagePath}`);
        return;
    }

    console.log(`📂 Found image file: ${imagePath}`);
    console.log(`   Size: ${(fs.statSync(imagePath).size / 1024).toFixed(2)} KB\n`);

    // Upload the image to Sanity
    console.log('⬆️  Uploading image to Sanity...');
    const imageAsset = await client.assets.upload('image', fs.createReadStream(imagePath), {
        filename: 'angelina-usanova-hero.webp',
    });

    console.log('✅ Image uploaded successfully!');
    console.log(`   Asset ID: ${imageAsset._id}`);
    console.log(`   URL: ${imageAsset.url}\n`);

    // Update the article with the hero image
    console.log('🔄 Updating article with hero image...');
    await client
        .patch(article._id)
        .set({
            heroImage: {
                _type: 'image',
                asset: {
                    _type: 'reference',
                    _ref: imageAsset._id,
                },
            },
        })
        .commit();

    console.log('✅ Article updated successfully!\n');

    // Fetch updated article to confirm
    const updatedArticle = await client.fetch(`
        *[_id == "${article._id}"][0] {
            _id,
            title,
            heroImage {
                asset-> {
                    _id,
                    url
                }
            }
        }
    `);

    console.log('📊 Final verification:');
    console.log(`   Article: ${updatedArticle.title}`);
    console.log(`   Hero Image URL: ${updatedArticle.heroImage?.asset?.url || 'Not set'}`);
    console.log('\n✨ Hero image upload complete!\n');
}

uploadAngelinaHeroImage().catch(console.error);
