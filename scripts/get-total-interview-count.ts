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

async function getTotalInterviewCount() {
    console.log('📊 Total Interview Article Count\n');
    console.log('═'.repeat(80) + '\n');

    // 1. CSA articles (all are interviews)
    const csaCount = await client.fetch(`
        count(*[_type == "csa" && !(_id in path("drafts.**"))])
    `);

    // 2. Articles in CXO Interview category
    const cxoCategoryId = await client.fetch(`
        *[_type == "category" && slug.current == "cxo-interview"][0]._id
    `);

    const cxoArticles = await client.fetch(`
        count(*[_type == "post" && !(_id in path("drafts.**")) && references($categoryId) && isHidden != true])
    `, { categoryId: cxoCategoryId });

    // 3. Articles with articleVariant = "interview"
    const interviewVariantCount = await client.fetch(`
        count(*[_type == "post" && !(_id in path("drafts.**")) && articleVariant == "interview" && isHidden != true])
    `);

    // 4. Total unique interview articles (CSA + CXO category articles)
    // Note: CSA articles are separate type, CXO category contains normal posts
    const totalInterviews = csaCount + cxoArticles;

    console.log('📈 Interview Article Breakdown:\n');
    console.log(`   CSA Articles (Company Sponsored):          ${csaCount}`);
    console.log(`   Articles in CXO Interview Category:        ${cxoArticles}`);
    console.log(`   Articles with "interview" variant:         ${interviewVariantCount}`);
    console.log('\n' + '─'.repeat(80));
    console.log(`   TOTAL INTERVIEW ARTICLES:                  ${totalInterviews}`);
    console.log('═'.repeat(80) + '\n');

    console.log('💡 Breakdown Explanation:\n');
    console.log('• CSA articles are separate content type, all count as interviews');
    console.log('• CXO Interview category contains regular post-type interviews');
    console.log('• "Interview variant" is a subset that may or may not be in CXO category');
    console.log(`\nTotal = CSA (${csaCount}) + CXO Category Posts (${cxoArticles}) = ${totalInterviews} interview articles\n`);
}

getTotalInterviewCount();
