import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createClient } from '@sanity/client';
import { config } from '../sanity/config';

// Use write token to bypass CDN completely
const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN,
});

async function finalCheck() {
  console.log('Checking Sanity with write token (no CDN)...\n')
  
  const doc = await client.fetch(
    `*[_type == "csa" && slug.current == "shrikant-vaidya-chairman-indianoil"][0]{ 
      _id,
      _rev,
      title,
      "bodyLength": length(body),
      "lastBlock": body[length(body) - 1]
    }`
  )
  
  console.log('Document ID:', doc._id)
  console.log('Revision:', doc._rev)
  console.log('Body length:', doc.bodyLength)
  console.log('\nLast block type:', doc.lastBlock?._type)
  console.log('Last block key:', doc.lastBlock?._key)
  
  if (doc.lastBlock?._type === 'partnerQuotes') {
    console.log('\n✅ PARTNER QUOTES IS THE LAST BLOCK!')
    console.log('Number of quotes:', doc.lastBlock.quotes?.length || 0)
  } else {
    console.log('\n❌ Last block is NOT partnerQuotes')
    console.log('Last block data:', JSON.stringify(doc.lastBlock, null, 2))
  }
}

finalCheck().then(() => process.exit(0))
