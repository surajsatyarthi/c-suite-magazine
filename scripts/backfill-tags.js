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
const STOP = new Set(['the','and','or','for','to','of','in','on','with','by','from','at','as','is','are','be','this','that','these','those','a','an','it','its','into','over','under','about','across','their','our','your','you','we','they','i'])
function normalize(s){return String(s||'').toLowerCase().replace(/[^a-z0-9\s\-&]/g,'').replace(/\s+/g,' ').trim()}
function topTerms(title, bodyText, exclude){
  const counts = new Map()
  const add = (t)=>{ const w = normalize(t); if(!w) return; for(const x of w.split(' ')){ const y = x.trim(); if(!y||y.length<3||STOP.has(y)||exclude.has(y)) continue; counts.set(y,(counts.get(y)||0)+1) } }
  add(title)
  add(bodyText)
  return Array.from(counts.entries()).sort((a,b)=> b[1]-a[1]).map(([w])=>w)
}
async function main(){
  const docs = await client.fetch(`*[_type=="post" && (!defined(tags) || count(tags[]) != 3)]{ _id, title, slug, tags, "categories": categories[]->{title, slug}, body }`)
  if(!docs.length){ console.log('No posts require backfill'); return }
  let changed=0
  for(const d of docs){
    const existing = Array.isArray(d.tags)? d.tags.map(x=>normalize(x)).filter(Boolean):[]
    const exSet = new Set(existing)
    const primaryCat = (Array.isArray(d.categories) && d.categories[0]) ? (normalize(d.categories[0].title)||normalize(d.categories[0].slug?.current||d.categories[0].slug)) : ''
    const bodyText = Array.isArray(d.body)? d.body.filter(b=>b?._type==='block').map(b=> Array.isArray(b.children)? b.children.map(c=>String(c.text||'')).join(' '):'').join(' '):''
    const candidates = topTerms(d.title||'', bodyText||'', exSet)
    const tags = [...existing]
    if(primaryCat && !exSet.has(primaryCat)) tags.push(primaryCat)
    for(const c of candidates){ if(tags.length>=3) break; if(!exSet.has(c)){ tags.push(c); exSet.add(c) } }
    while(tags.length<3){ tags.push('insight') }
    if(tags.length>3){ tags.length=3 }
    if(APPLY){ try{ await client.patch(d._id).set({ tags }).commit({ autoGenerateArrayKeys:true }); changed++; console.log(`✔ ${d.slug?.current||d._id} -> [${tags.join(', ')}]`) }catch(e){ console.error(`✘ ${d._id}`, e?.message||e) } }
    else { console.log(`DRY ${d.slug?.current||d._id} -> [${tags.join(', ')}]`) }
  }
  if(APPLY) console.log(`Done. Updated ${changed}/${docs.length}`)
}
main().catch(e=>{ console.error(e?.message||e); process.exit(1) })