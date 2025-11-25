const {getCliClient} = require('sanity/cli')
const client = getCliClient({ apiVersion: '2024-10-01' })

async function run() {
  const legacy = await client.fetch("*[_type=='post' && (defined(metaTitle) || defined(metaDescription))]{_id,metaTitle,metaDescription}")
  for (const d of legacy) {
    const seo = {}
    if (d.metaTitle) seo.metaTitle = d.metaTitle
    if (d.metaDescription) seo.metaDescription = d.metaDescription
    await client.patch(d._id).set({ seo }).unset(['metaTitle','metaDescription']).commit({ autoGenerateArrayKeys: true })
    process.stdout.write(`migrated ${d._id}\n`)
  }
  const remaining = await client.fetch("count(*[_type=='post' && (defined(metaTitle) || defined(metaDescription))])")
  process.stdout.write(`remaining ${remaining}\n`)
}

run().catch((e) => { console.error(e); process.exit(1) })
