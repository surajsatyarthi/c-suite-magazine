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

async function checkVideo() {
  const articleId = 'l1PaX4hS53uLi0tV4V3Bog'
  
  const doc = await client.fetch(
    `*[_id == $id][0]{ _id, title, body }`,
    { id: articleId }
  )
  
  console.log('Article:', doc.title)
  console.log('Total body blocks:', doc.body.length)
  
  const videoBlocks = doc.body.filter((b: any) => b._type === 'video')
  console.log('\n📹 Video blocks found:', videoBlocks.length)
  
  videoBlocks.forEach((v: any, i: number) => {
    console.log(`\nVideo ${i + 1}:`)
    console.log('  URL:', v.url)
    console.log('  Caption:', v.caption)
    console.log('  Key:', v._key)
  })
}

checkVideo().then(() => process.exit(0))
