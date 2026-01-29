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

async function findPartnerQuotes() {
  // Check if the document has the partner quotes at all
  const doc = await client.fetch(
    `*[_type == "csa" && slug.current == "shrikant-vaidya-chairman-indianoil"][0]`
  )
  
  console.log('Document ID:', doc._id)
  console.log('Body array length:', doc.body?.length || 0)
  
  // Look for any partnerQuotes blocks
  const hasPartnerQuotes = doc.body?.some((block: any) => block._type === 'partnerQuotes')
  console.log('Has partnerQuotes block:', hasPartnerQuotes)
  
  // Show last 5 blocks
  console.log('\nLast 5 blocks:')
  const last5 = doc.body?.slice(-5) || []
  last5.forEach((block: any, i: number) => {
    console.log(`${i + 1}. Type: ${block._type}, Key: ${block._key}`)
  })
}

findPartnerQuotes().then(() => process.exit(0))
