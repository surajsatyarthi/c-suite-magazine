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

async function removeDuplicate() {
  const doc = await client.fetch(
    `*[_type == "csa" && slug.current == "shrikant-vaidya-chairman-indianoil"][0]{ _id, body }`
  )
  
  // Keep only the last partnerQuotes block
  const newBody = doc.body.filter((block: any, index: number) => {
    if (block._type !== 'partnerQuotes') return true
    // Find all partnerQuotes indices
    const allPartnerQuotesIndices = doc.body
      .map((b: any, i: number) => b._type === 'partnerQuotes' ? i : -1)
      .filter((i: number) => i !== -1)
    // Keep only the last one
    return index === allPartnerQuotesIndices[allPartnerQuotesIndices.length - 1]
  })
  
  console.log(`Removing duplicate. Original: ${doc.body.length}, New: ${newBody.length}`)
  
  await client
    .patch(doc._id)
    .set({ body: newBody })
    .commit()
  
  console.log('✅ Removed duplicate partner quotes block')
}

removeDuplicate().then(() => process.exit(0))
