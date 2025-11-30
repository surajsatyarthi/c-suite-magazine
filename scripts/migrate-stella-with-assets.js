const { createClient } = require('@sanity/client')
const fs = require('fs')
const https = require('https')

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

async function migrateAsset(assetId) {
  // Check if exists in prod
  const existing = await clientProd.getDocument(assetId)
  if (existing) {
    console.log('Asset already exists:', assetId)
    return
  }

  console.log('Migrating asset:', assetId)
  // Fetch from fixed
  const assetDoc = await clientFixed.getDocument(assetId)
  if (!assetDoc) {
    console.error('Asset not found in fixed:', assetId)
    return
  }

  // If it's an image, we might need to re-upload or just copy the document if the file is accessible?
  // Sanity assets are documents. If we copy the document, it *should* point to the same file in the cloud storage IF the dataset shares the same project storage.
  // Usually datasets in the same project share assets. Let's try copying the asset document first.
  try {
    await clientProd.createOrReplace(assetDoc)
    console.log('Asset migrated:', assetId)
  } catch (err) {
    console.error('Asset migration failed:', err.message)
  }
}

async function migrate() {
  const id = 'c79a5d71-febd-4fe1-8dc1-e153c5be57b1'
  
  console.log('Fetching article...')
  const doc = await clientFixed.getDocument(id)
  if (!doc) return

  // Find all references
  const refs = []
  function findRefs(obj) {
    if (!obj) return
    if (typeof obj === 'object') {
      if (obj._ref) refs.push(obj._ref)
      for (const key in obj) findRefs(obj[key])
    } else if (Array.isArray(obj)) {
      obj.forEach(findRefs)
    }
  }
  findRefs(doc)
  
  const uniqueRefs = [...new Set(refs)]
  console.log('Found references:', uniqueRefs.length)

  for (const ref of uniqueRefs) {
    // We only migrate assets (images/files) usually, but maybe categories too?
    // Let's try to migrate EVERYTHING referenced just to be safe.
    await migrateAsset(ref)
  }

  console.log('Creating article...')
  try {
    const res = await clientProd.createOrReplace(doc)
    console.log('Success! Migrated to Production:', res._id)
  } catch (err) {
    console.error('Article migration failed:', err.message)
  }
}

migrate()
