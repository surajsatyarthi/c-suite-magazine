const { createClient } = require('@sanity/client')
require('dotenv').config({ path: './.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const approvedSlugs = [
  'aisha-farouk',
  'alicia-gomez',
  'arjun-mehta',
  'carlos-mendes',
  'david-okoro',
  'elena-petrov',
  'emma-williams',
  'linh-nguyen',
  'martin-kessler',
  'maya-whitfield',
  'michael-chen',
  'priya-raman',
  'raj-patel',
  'sarah-johnson',
  'sofia-alvarez',
]

async function main() {
  const q = 'count(*[_type=="post" && defined(author) && !(author->slug.current in $slugs)])'
  const count = await client.fetch(q, { slugs: approvedSlugs })
  // Print number only
  console.log(String(count))
}

main().catch((e)=>{ console.error(e); process.exit(1) })
