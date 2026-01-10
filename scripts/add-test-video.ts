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

async function addTestVideo() {
  const articleId = 'l1PaX4hS53uLi0tV4V3Bog'
  
  const doc = await client.fetch(
    `*[_id == $id][0]{ _id, title, body }`,
    { id: articleId }
  )
  
  console.log('Article:', doc.title)
  
  // Find the existing video block
  const videoIndex = doc.body.findIndex((b: any) => b._type === 'video')
  
  if (videoIndex === -1) {
    console.log('No video found')
    return
  }
  
  console.log('Found video at index:', videoIndex)
  
  // Create new test video block
  const testVideo = {
    _type: 'video',
    _key: `video-test-${Date.now()}`,
    url: 'https://youtu.be/WBU7uTeKo9g',
    caption: 'Test Video - Checking Embed Functionality'
  }
  
  // Insert test video right after the existing video
  const newBody = [
    ...doc.body.slice(0, videoIndex + 1),
    testVideo,
    ...doc.body.slice(videoIndex + 1)
  ]
  
  await client
    .patch(articleId)
    .set({ body: newBody })
    .commit()
  
  console.log('✅ Added test video after existing video!')
}

addTestVideo().then(() => process.exit(0))
