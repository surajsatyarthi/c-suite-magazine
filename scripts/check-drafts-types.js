const {getCliClient} = require('sanity/cli')
const client = getCliClient({ apiVersion: '2024-10-01' })

async function run() {
  const types = await client.fetch("*[_id match 'drafts.*']{_type}")
  const counts = types.reduce((acc, d) => { acc[d._type] = (acc[d._type]||0)+1; return acc }, {})
  console.log('draft_type_counts', counts)
}

run().catch((e)=>{console.error(e);process.exit(1)})
