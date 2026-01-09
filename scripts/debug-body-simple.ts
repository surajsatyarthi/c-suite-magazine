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

async function debugBody() {
  const article = await client.fetch(
    `*[_type == "csa" && slug.current == "shrikant-vaidya-chairman-indianoil"][0] { 
      title,
      "bodyLength": length(body),
      "bodyTypes": body[]._type,
      "partnerQuotesCount": count(body[_type == "partnerQuotes"]),
      "blockquoteCount": count(body[_type == "block" && style == "blockquote"])
    }`
  )
  
  console.log('Article:', article.title)
  console.log('Total blocks:', article.bodyLength)
  console.log('Partner quotes blocks:', article.partnerQuotesCount)
  console.log('Blockquotes:', article.blockquoteCount)
  console.log('\nAll block types:')
  const types = article.bodyTypes.reduce((acc: any, type: string) => {
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})
  console.log(JSON.stringify(types, null, 2))
}

debugBody().then(() => process.exit(0))
