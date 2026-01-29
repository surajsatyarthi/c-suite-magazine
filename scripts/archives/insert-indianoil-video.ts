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

async function insertVideoIntoArticle() {
    console.log('📹 Inserting YouTube Video into Indian Oil Article\n');

    const articleId = 'l1PaX4hS53uLi0tV4V3Bog';
    const videoUrl = 'https://youtu.be/bGxmGLtfnow';

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
            console.error('❌ Article body is empty! Cannot insert video.');
            return;
        }

        // Create video block
        const videoBlock = {
            _type: 'video',
            _key: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: videoUrl,
            caption: 'India Oil Conference - Promoting Eco-Tourism'
        };

        console.log('🎥 Video block created:');
        console.log(`   URL: ${videoUrl}`);
        console.log(`   Caption: India Oil Conference - Promoting Eco-Tourism\n`);

        // Find insertion point: after the paragraph about 100-octane petrol
        // Looking for: "It's quite an achievement. Only six countries in the world have this capability"
        
        const newBody = [...body];
        let insertionPoint = -1;

        for (let i = 0; i < newBody.length; i++) {
            const block = newBody[i];
            
            if (block._type === 'block' && block.children) {
                const text = block.children.map((c: any) => c.text).join('').toLowerCase();

                // Find the paragraph: "It's quite an achievement. Only six countries..."
                if (text.includes("it's quite an achievement") && text.includes("only six countries")) {
                    insertionPoint = i + 1;
                    console.log(`✅ Found insertion point at block ${i}`);
                    console.log(`   Text preview: ${text.substring(0, 80)}...\n`);
                    break;
                }
            }
        }

        if (insertionPoint === -1) {
            console.error('❌ Could not find insertion point!');
            console.log('\n📝 Searching for alternative text patterns...\n');
            
            // Alternative search: look for "this capability" or "technical superiority"
            for (let i = 0; i < newBody.length; i++) {
                const block = newBody[i];
                if (block._type === 'block' && block.children) {
                    const text = block.children.map((c: any) => c.text).join('').toLowerCase();
                    
                    if (text.includes('technical superiority') && text.includes('this capability')) {
                        insertionPoint = i + 1;
                        console.log(`✅ Found alternative insertion point at block ${i}`);
                        console.log(`   Text preview: ${text.substring(0, 80)}...\n`);
                        break;
                    }
                }
            }
        }

        if (insertionPoint === -1) {
            console.error('❌ Still could not find insertion point. Listing relevant blocks:\n');
            body.forEach((block: any, i: number) => {
                if (block._type === 'block' && block.children) {
                    const text = block.children.map((c: any) => c.text).join('');
                    if (text.toLowerCase().includes('octane') || text.toLowerCase().includes('technical')) {
                        console.log(`Block ${i}: ${text.substring(0, 100)}...`);
                    }
                }
            });
            return;
        }

        // Insert video block
        newBody.splice(insertionPoint, 0, videoBlock);
        console.log(`📹 Inserted video at position ${insertionPoint}\n`);

        // Update the article
        console.log('💾 Updating article in Sanity...');
        await client
            .patch(articleId)
            .set({ body: newBody })
            .commit();

        console.log('✅ Article updated successfully!\n');
        console.log(`🔗 View article: https://csuitemagazine.global/csa/shrikant-vaidya-chairman-indianoil\n`);
        console.log('🎉 Video integration complete!\n');

    } catch (error) {
        console.error('❌ Error inserting video:', error);
        throw error;
    }
}

insertVideoIntoArticle();
