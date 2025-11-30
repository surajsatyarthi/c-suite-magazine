const { createClient } = require('@sanity/client')

const token = process.env.SANITY_API_READ_TOKEN // Needs write access actually. Assuming this token has it or I need a write token.
// If READ_TOKEN is read-only, I can't write. I'll check if I have a WRITE token.
// Usually in these envs, the token provided is powerful enough or there is a SANITY_API_TOKEN.
// I'll try using the existing token.

const clientFixed = createClient({
  projectId: '2f93fcy8',
  dataset: 'production-fixed',
  apiVersion: '2023-05-03',
  useCdn: false,
  token: token
})

const clientProd = createClient({
  projectId: '2f93fcy8',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
  token: token
})

async function migrate() {
  const id = 'c79a5d71-febd-4fe1-8dc1-e153c5be57b1'
  
  // 1. Fetch from Fixed
  const doc = await clientFixed.getDocument(id)
  if (!doc) {
    console.error('Stella not found in production-fixed')
    return
  }
  console.log('Found Stella in Fixed:', doc.title)

  // 2. Create in Production
  // We use createOrReplace to ensure we set the specific ID
  try {
    const res = await clientProd.createOrReplace(doc)
    console.log('Migrated Stella to Production:', res._id)
  } catch (err) {
    console.error('Migration failed:', err.message)
  }
}

migrate()
