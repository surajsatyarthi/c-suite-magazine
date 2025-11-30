const { createClient } = require('@sanity/client')

const token = 'sk9nJvXt0D2WtCNrQBt7tmpUx5wqX6bHOuRCRE6lwGUvtDQDFGeV0qyhUKqq3TECQGbd41uGdkZyvoeNOFRMKCIXBEyAyWhkJgwJvktBwBiz5Ks6O52YHA1rbbW67w2syd4m4eSYtPbIeNjNtmWBE4dNWPmgRg3Qjrc3kATEy0v7TSUZCYag'

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
  
  console.log('Fetching from production-fixed...')
  const doc = await clientFixed.getDocument(id)
  if (!doc) {
    console.error('Stella not found in production-fixed')
    return
  }
  console.log('Found:', doc.title)

  console.log('Creating in production...')
  try {
    const res = await clientProd.createOrReplace(doc)
    console.log('Success! Migrated to Production:', res._id)
  } catch (err) {
    console.error('Migration failed:', err.message)
  }
}

migrate()
