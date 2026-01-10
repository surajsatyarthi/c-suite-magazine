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

async function updateVideo() {
  const articleId = 'l1PaX4hS53uLi0tV4V3Bog'
  
  const doc = await client.fetch(
    `*[_id == $id][0]{ _id, title, body }`,
    { id: articleId }
  )
  
  console.log('Article:', doc.title)
  
  // Update video URL to the new one (without timestamp)
  const newBody = doc.body.map((block: any) => {
    if (block._type === 'video') {
      console.log('Updating video URL from:', block.url)
      return {
        ...block,
        url: 'https://www.youtube.com/watch?v=0_d15JUt5Jw',
        caption: 'India Oil Conference - Promoting Eco-Tourism'
      }
    }
    return block
  })
  
  await client
    .patch(articleId)
    .set({ body: newBody })
    .commit()
  
  console.log('✅ Updated video URL!')
}

updateVideo().then(() => process.exit(0))
