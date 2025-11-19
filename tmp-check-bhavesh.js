const { createClient } = require('@sanity/client')
require('dotenv').config({ path: './.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function main() {
  const q = `{
    "authorRefs": count(*[_type=="post" && author->slug.current=="bhavesh-aggarwal"]),
    "editorRefs": count(*[_type=="post" && editor->slug.current=="bhavesh-aggarwal"])
  }`
  const res = await client.fetch(q)
  console.log('Bhavesh references:', res)
}

main().catch((e)=>{ console.error(e); process.exit(1) })
