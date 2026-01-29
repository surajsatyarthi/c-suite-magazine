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

async function checkPartnerQuotes() {
  const article = await client.fetch(
    `*[_type == "csa" && slug.current == "shrikant-vaidya-chairman-indianoil"][0] { 
      title,
      "bodyLength": length(body),
      "lastBlock": body[length(body) - 1],
      "partnerQuotesBlocks": body[_type == "partnerQuotes"]
    }`
  )
  
  console.log('Article:', article.title)
  console.log('Total body blocks:', article.bodyLength)
  console.log('\nLast block in body:')
  console.log(JSON.stringify(article.lastBlock, null, 2))
  console.log('\nPartner quotes blocks found:', article.partnerQuotesBlocks?.length || 0)
  if (article.partnerQuotesBlocks?.length > 0) {
    console.log('\nPartner quotes data:')
    console.log(JSON.stringify(article.partnerQuotesBlocks[0], null, 2))
  }
}

checkPartnerQuotes().then(() => process.exit(0))
