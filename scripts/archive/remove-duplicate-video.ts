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
  const articleId = 'l1PaX4hS53uLi0tV4V3Bog'
  
  const doc = await client.fetch(
    `*[_id == $id][0]{ _id, title, body }`,
    { id: articleId }
  )
  
  console.log('Article:', doc.title)
  console.log('Body blocks before:', doc.body.length)
  
  // Remove duplicate video - keep only the first one
  const videoKeys = new Set()
  const newBody = doc.body.filter((block: any) => {
    if (block._type === 'video') {
      if (videoKeys.has(block.url)) {
        console.log('Removing duplicate video:', block._key)
        return false // Remove duplicate
      }
      videoKeys.add(block.url)
    }
    return true
  })
  
  console.log('Body blocks after:', newBody.length)
  
  await client
    .patch(articleId)
    .set({ body: newBody })
    .commit()
  
  console.log('✅ Removed duplicate video!')
}

removeDuplicate().then(() => process.exit(0))
