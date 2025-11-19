const { createClient } = require('@sanity/client')
require('dotenv').config()
require('dotenv').config({ path: '.env.local' })
const args = process.argv.slice(2)
const map = {}
for (const a of args) { const [k,v] = a.split('='); if (k && v) map[k.replace(/^--/,'')] = v }
const slug = map.slug
const phrase = (map.phrase || '').toLowerCase()
const apply = args.includes('--apply')
if (!slug || !phrase) { console.error('usage: node scripts/remove-phrase-from-post.js --slug=<slug> --phrase=<phrase> --apply'); process.exit(1) }
const client = createClient({ projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production', apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01', token: process.env.SANITY_API_TOKEN, useCdn: false })
;(async () => {
  const doc = await client.fetch('*[_type=="post" && slug.current==$slug][0]{ _id, body }', { slug })
  if (!doc?._id) { console.log('not found'); process.exit(0) }
  const body = Array.isArray(doc.body) ? doc.body : []
  const filtered = body.filter(b => {
    if (b?._type !== 'block') return true
    const text = Array.isArray(b.children) ? b.children.map(c => String(c.text || '')).join(' ') : ''
    return !text.toLowerCase().includes(phrase)
  })
  if (!apply) { console.log('dry-run filtered blocks:', body.length, '->', filtered.length); process.exit(0) }
  await client.patch(doc._id).set({ body: filtered }).commit({ autoGenerateArrayKeys: true })
  console.log('updated', doc._id, body.length, '->', filtered.length)
})().catch(e => { console.error(e?.message || e); process.exit(1) })