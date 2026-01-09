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

async function verifyPullQuotes() {
  const article = await client.fetch(
    `*[_type == "csa" && slug.current == "shrikant-vaidya-chairman-indianoil"][0] { 
      title,
      "bodyLength": length(body),
      "blockquotes": body[style == "blockquote"]
    }`
  )
  
  console.log('Article:', article.title)
  console.log('Total body blocks:', article.bodyLength)
  console.log('Blockquotes found:', article.blockquotes.length)
  console.log('\nBlockquote texts:')
  article.blockquotes.forEach((quote: any, i: number) => {
    const text = quote.children[0].text
    console.log(`\n${i + 1}. "${text.substring(0, 80)}..."`)
  })
}

verifyPullQuotes().then(() => process.exit(0))
