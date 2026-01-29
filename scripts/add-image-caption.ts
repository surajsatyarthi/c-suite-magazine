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

async function addCaption() {
  const articleId = 'l1PaX4hS53uLi0tV4V3Bog'
  
  const doc = await client.fetch(
    `*[_id == $id][0]{ _id, title, body }`,
    { id: articleId }
  )
  
  console.log('Article:', doc.title)
  console.log('Total blocks:', doc.body.length)
  
  // Find image blocks and add caption to the building image
  // Looking for images without captions or with generic captions
  const newBody = doc.body.map((block: any, index: number) => {
    if (block._type === 'image') {
      console.log(`Image ${index}:`, block.alt || 'No alt text')
      // Add caption to first image (likely the building)
      if (index < 10 && !block.caption) {
        console.log('Adding caption to image at index', index)
        return {
          ...block,
          caption: 'IOCL HQ Delhi'
        }
      }
    }
    return block
  })
  
  await client
    .patch(articleId)
    .set({ body: newBody })
    .commit()
  
  console.log('✅ Added image caption!')
}

addCaption().then(() => process.exit(0))
