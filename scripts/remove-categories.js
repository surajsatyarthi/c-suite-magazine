#!/usr/bin/env node
const { createClient } = require('@sanity/client')
try { require('dotenv').config(); require('dotenv').config({ path: '.env.local' }) } catch (_) {}
const slugs = ['business','cover-story','events','retail']
const APPLY = process.argv.includes('--apply')
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'
if (!projectId || !dataset) { console.error('Missing SANITY env'); process.exit(1) }
if (!token && APPLY) { console.error('Missing SANITY write token'); process.exit(1) }
const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })
async function main() {
  const cats = await client.fetch(`*[_type=="category" && slug.current in $slugs]{_id, title, slug}`, { slugs })
  if (!cats.length) { console.log('No matching categories found'); return }
  const catIds = cats.map(c=>c._id)
  const posts = await client.fetch(`*[_type=="post" && count(categories[]._ref in $catIds) > 0]{ _id, categories }`, { catIds })
  for (const p of posts) {
    const filtered = (p.categories||[]).filter(x=> !catIds.includes(x?._ref))
    if (APPLY) {
      try { await client.patch(p._id).set({ categories: filtered }).commit({ autoGenerateArrayKeys: true }); console.log(`✔ cleaned ${p._id}`) } catch(e){ console.error(`✘ ${p._id}`, e?.message||e) }
    } else {
      console.log('DRY-RUN clean', p._id)
    }
  }
  for (const c of cats) {
    const ids = [c._id]
    if (APPLY) {
      for (const id of ids) { try { await client.delete(id); console.log(`✔ deleted ${id}`) } catch(e){ console.error(`✘ delete ${id}`, e?.message||e) } }
    } else {
      console.log('DRY-RUN delete', ids)
    }
  }
}
main().catch(e=>{ console.error(e?.message||e); process.exit(1) })