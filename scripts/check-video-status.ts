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

async function checkVideoInArticle() {
    const articleId = 'l1PaX4hS53uLi0tV4V3Bog';

    try {
        const article = await client.getDocument(articleId);
        const body = (article as any).body || [];

        console.log('🔍 Checking for video blocks in article...\n');
        console.log(`Total blocks: ${body.length}\n`);

        const videoBlocks = body.filter((block: any) => block._type === 'video');
        console.log(`Video blocks found: ${videoBlocks.length}\n`);

        if (videoBlocks.length > 0) {
            videoBlocks.forEach((video: any, i: number) => {
                console.log(`Video ${i + 1}:`);
                console.log(`  URL: ${video.url}`);
                console.log(`  Caption: ${video.caption}`);
                console.log(`  Key: ${video._key}\n`);
            });
        } else {
            console.log('❌ No video blocks found in article body!\n');
            console.log('Checking block types:\n');
            
            const blockTypes = body.reduce((acc: any, block: any) => {
                acc[block._type] = (acc[block._type] || 0) + 1;
                return acc;
            }, {});
            
            console.log('Block type distribution:');
            Object.entries(blockTypes).forEach(([type, count]) => {
                console.log(`  ${type}: ${count}`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

checkVideoInArticle();
