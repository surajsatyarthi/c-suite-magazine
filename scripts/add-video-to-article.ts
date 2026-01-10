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

async function addVideo() {
  const articleId = 'l1PaX4hS53uLi0tV4V3Bog' // Published document ID
  
  const doc = await client.fetch(
    `*[_id == $id][0]{ _id, title, body }`,
    { id: articleId }
  )
  
  if (!doc) {
    console.error('❌ Article not found')
    return
  }
  
  console.log('✅ Found article:', doc.title)
  console.log('Current body blocks:', doc.body.length)
  
  // Create video block
  const videoBlock = {
    _type: 'video',
    _key: `video-${Date.now()}`,
    url: 'https://youtu.be/bGxmGLtfnow',
    caption: 'India Oil Conference - Promoting Eco-Tourism'
  }
  
  // Insert video after first few paragraphs (around position 5)
  const newBody = [
    ...doc.body.slice(0, 5),
    videoBlock,
    ...doc.body.slice(5)
  ]
  
  console.log('\n✅ Adding video to article')
  
  await client
    .patch(articleId)
    .set({ body: newBody })
    .commit()
  
  console.log('\n🎉 Successfully added video!')
  console.log(`✅ Updated body: ${newBody.length} blocks (was ${doc.body.length})`)
}

addVideo().then(() => process.exit(0))
