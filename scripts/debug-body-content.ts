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
});

async function debugBodyContent() {
  const article = await client.fetch(
    `*[_type == "csa" && slug.current == "shrikant-vaidya-chairman-indianoil"][0] { 
      title,
      "bodyLength": length(body),
      "bodyTypes": body[]._type,
      "lastThreeBlocks": body[length(body) - 3...length(body)]
    }`
  )
  
  console.log('Article:', article.title)
  console.log('Total blocks:', article.bodyLength)
  console.log('\nBlock types in body:', JSON.stringify(article.bodyTypes, null, 2))
  console.log('\nLast 3 blocks:')
  console.log(JSON.stringify(article.lastThreeBlocks, null, 2))
}

debugBodyContent().then(() => process.exit(0))
