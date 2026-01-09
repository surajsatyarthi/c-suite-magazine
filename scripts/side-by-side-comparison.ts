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

function extractTextFromBody(body: any[]): string {
    if (!body) return '';

    return body.map((block, index) => {
        if (block._type === 'block') {
            const text = block.children
                ?.map((child: any) => child.text || '')
                .join('') || '';

            // Add formatting based on style
            if (block.style === 'h1') return `\n# ${text}\n`;
            if (block.style === 'h2') return `\n## ${text}\n`;
            if (block.style === 'h3') return `\n### ${text}\n`;
            if (block.style === 'blockquote') return `\n> ${text}\n`;
            return text + '\n';
        }
        return '';
    }).join('');
}

async function sideBySideComparison() {
    const id = 'Xj1aOvHL2Hs0lhtupB0F2K';

    const published = await client.fetch(`*[_id == $id][0]{ title, body }`, { id });
    const draft = await client.fetch(`*[_id == $draftId][0]{ title, body }`, { draftId: `drafts.${id}` });

    const publishedText = extractTextFromBody(published.body);
    const draftText = extractTextFromBody(draft.body);

    console.log('═'.repeat(100));
    console.log('SIDE-BY-SIDE COMPARISON: Published vs Draft');
    console.log('═'.repeat(100));
    console.log('\n📄 PUBLISHED VERSION');
    console.log('─'.repeat(100));
    console.log(publishedText);

    console.log('\n\n📝 DRAFT VERSION');
    console.log('─'.repeat(100));
    console.log(draftText);

    console.log('\n═'.repeat(100));
    console.log('SUMMARY');
    console.log('═'.repeat(100));

    const pubWords = publishedText.split(/\s+/).filter(w => w.length > 0).length;
    const draftWords = draftText.split(/\s+/).filter(w => w.length > 0).length;

    console.log(`Published word count: ${pubWords} words`);
    console.log(`Draft word count: ${draftWords} words`);
    console.log(`Difference: ${draftWords - pubWords} words (${draftWords > pubWords ? 'Draft is longer' : 'Published is longer'})`);
    console.log('\n');
}

sideBySideComparison().catch(console.error);
