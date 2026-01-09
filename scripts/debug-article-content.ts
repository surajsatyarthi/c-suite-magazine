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

async function fetchArticleContent() {
    const articleId = 'l1PaX4hS53uLi0tV4V3Bog';

    try {
        const article = await client.getDocument(articleId);

        if (!article) {
            console.error('❌ Article not found!');
            return;
        }

        console.log(`✅ Found article: "${(article as any).title}"\n`);

        const content = (article as any).content || [];

        console.log(`📊 Total content blocks: ${content.length}\n`);
        console.log('📝 Content Block Analysis:\n');

        // Analyze each block
        content.forEach((block: any, index: number) => {
            if (block._type === 'block' && block.children) {
                const text = block.children.map((c: any) => c.text).join('');
                const preview = text.substring(0, 100);
                console.log(`Block ${index} (${block.style || 'normal'}): ${preview}${text.length > 100 ? '...' : ''}`);
            } else if (block._type === 'image') {
                console.log(`Block ${index} (image): [Image block]`);
            } else {
                console.log(`Block ${index} (${block._type}): [${block._type} block]`);
            }
        });

        // Save full content for analysis
        const outputPath = path.join(__dirname, 'article-content-debug.json');
        fs.writeFileSync(outputPath, JSON.stringify(content, null, 2));
        console.log(`\n💾 Saved full content to: ${outputPath}`);

    } catch (error) {
        console.error('❌ Error fetching article:', error);
    }
}

fetchArticleContent();
