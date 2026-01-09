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

async function check() {
  const doc = await client.fetch(
    `*[_type == "csa" && slug.current == "shrikant-vaidya-chairman-indianoil"][0]{ 
      _id, 
      "bodyLength": length(body),
      "partnerQuotesCount": count(body[_type == "partnerQuotes"])
    }`
  )
  
  console.log('Body length:', doc.bodyLength)
  console.log('Partner quotes blocks:', doc.partnerQuotesCount)
}

check().then(() => process.exit(0))
