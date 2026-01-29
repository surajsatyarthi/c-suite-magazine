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

async function testQuery() {
  // Use the EXACT query from page.tsx
  const query = `*[_type in ["post","article","csa"] && (slug.current == $slug || slug == $slug) && (_type == "csa" || isHidden != true)][0] {
    _id,
    _type,
    title,
    slug,
    body[]{
      ...,
      _type == "image" => {
        ...,
        asset->,
        targetUrl,
        isPopupTrigger
      },
      _type == "partnerQuotes" => {
        ...,
        quotes[]{
          _key,
          _type,
          company,
          name,
          title,
          quote
        }
      }
    }
  }`
  
  const result = await client.fetch(query, { slug: 'shrikant-vaidya-chairman-indianoil' })
  
  console.log('Article:', result.title)
  console.log('Body blocks:', result.body.length)
  
  const partnerQuotesBlocks = result.body.filter((b: any) => b._type === 'partnerQuotes')
  console.log('\nPartner quotes blocks found:', partnerQuotesBlocks.length)
  
  if (partnerQuotesBlocks.length > 0) {
    console.log('\nPartner quotes data:')
    console.log(JSON.stringify(partnerQuotesBlocks[0], null, 2))
  } else {
    console.log('\n❌ NO PARTNER QUOTES IN QUERY RESULT')
    console.log('\nLast 3 blocks:')
    console.log(JSON.stringify(result.body.slice(-3), null, 2))
  }
}

testQuery().then(() => process.exit(0))
