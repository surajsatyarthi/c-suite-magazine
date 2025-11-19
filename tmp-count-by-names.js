const { createClient } = require('@sanity/client')
require('dotenv').config({ path: './.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// Names provided by user (deduplicated)
const names = Array.from(new Set([
  'Angelina Usanova',
  'Dr. Basma Ghandourah',
  'Bill Faruki',
  'Bryce Tully',
  'Cal Riley',
  'Swami Aniruddha',
  'Supreet Nagi',
  'John Zangardi',
  'Stoyana Natseva',
  "Not Every Executive Aims To Revolutionize Society, But Stoyana Natseva Knew Her Direction Would Be Unique. Subtly Influential, Purposefully Deliberate, And Spiritually Motivated, Her Objective Extends Beyond Guidanceit's To Inspire Enlightenment",
  'Rtf1ansiansicpg1252cocoartf2761',
  'Pankaj Bansal',
]))

async function main() {
  // Count posts where the author reference's name matches any in the list
  const q = 'count(*[_type=="post" && defined(author) && author->name in $names])'
  const count = await client.fetch(q, { names })
  // Print number only
  console.log(String(count))
}

main().catch((e)=>{ console.error(e); process.exit(1) })
