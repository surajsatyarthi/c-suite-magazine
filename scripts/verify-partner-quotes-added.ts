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
    token: process.env.SANITY_WRITE_TOKEN,
});

async function verify() {
  const doc = await client.fetch(
    `*[_type == "csa" && slug.current == "shrikant-vaidya-chairman-indianoil"][0]{
      _id,
      title,
      "bodyLength": length(body),
      "partnerQuotesBlocks": body[_type == "partnerQuotes"]{
        _type,
        _key,
        "quoteCount": length(quotes)
      }
    }`
  )
  
  console.log('Article:', doc.title)
  console.log('Body length:', doc.bodyLength)
  console.log('Partner quotes blocks:', JSON.stringify(doc.partnerQuotesBlocks, null, 2))
}

verify().then(() => process.exit(0))
