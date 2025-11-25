const {getCliClient} = require('sanity/cli')
const client = getCliClient({ apiVersion: '2024-10-01' })

async function upsert() {
  const slug = 'api-seo-test'
  const existing = await client.fetch("*[_type=='post' && slug.current==$s][0]{_id, seo, metaTitle, metaDescription}", {s: slug})
  const base = {
    _type: 'post',
    title: 'API SEO Test',
    slug: { current: slug },
    excerpt: 'Testing nested SEO write via CLI',
    body: [{ _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Body paragraph for shape test' }], markDefs: [] }],
    seo: { metaTitle: 'API Test Meta Title', metaDescription: 'API Test Meta Description' },
  }
  let id = existing?._id
  if (id) {
    await client.patch(id).set(base).commit({ autoGenerateArrayKeys: true })
  } else {
    const res = await client.create(base)
    id = res._id
  }
  const doc = await client.fetch("*[_id==$id][0]", { id })
  const shapeOk = !!(doc?.seo && typeof doc.seo === 'object' && !doc.metaTitle && !doc.metaDescription)
  process.stdout.write(JSON.stringify({ id, shapeOk, seo: doc?.seo }, null, 2) + "\n")
  // cleanup
  await client.delete(id)
}

upsert().catch((e) => { console.error(e); process.exit(1) })
