const {getCliClient} = require('sanity/cli')
const client = getCliClient({ apiVersion: '2024-10-01' })

async function run() {
  const count = await client.fetch("count(*[_type=='post' && (defined(metaTitle) || defined(metaDescription))])")
  process.stdout.write(`legacy_count ${count}\n`)
}

run().catch((e) => { console.error(e); process.exit(1) })
