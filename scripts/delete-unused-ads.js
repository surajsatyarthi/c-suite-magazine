#!/usr/bin/env node
const { createClient } = require('@sanity/client')
try { require('dotenv').config(); require('dotenv').config({ path: '.env.local' }) } catch {}
const APPLY = process.argv.includes('--apply')
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'
if (!projectId || !dataset) { console.error('Missing SANITY env'); process.exit(1) }
if (!token && APPLY) { console.error('Missing SANITY write token'); process.exit(1) }
const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })
const ALLOWED = new Set(['article-sidebar-large', 'in-article'])
async function main(){
  const docs = await client.fetch(`*[_type=="advertisement" && !("article-sidebar-large" == placement || "in-article" == placement)]{ _id, name, placement }`)
  if(!docs.length){ console.log('No unused ad docs found'); return }
  console.log(`Found ${docs.length} unused ads`) 
  for (const d of docs) {
    if (APPLY) {
      try { await client.delete(d._id); console.log(`✔ deleted ${d._id} [${d.placement}]`) } catch(e){ console.error(`✘ ${d._id}`, e?.message||e) }
    } else {
      console.log('DRY delete', d._id, d.placement)
    }
  }
}
main().catch(e=>{ console.error(e?.message||e); process.exit(1) })