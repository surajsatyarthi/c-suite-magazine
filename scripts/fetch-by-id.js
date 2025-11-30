const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: '2f93fcy8',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN // Use token to see drafts if available
})

async function fetchById() {
  const id = 'c79a5d71-febd-4fe1-8dc1-e153c5be57b1'
  const query = `*[_id == $id || _id == "drafts." + $id]`
  const posts = await client.fetch(query, { id })
  console.log('Document by ID:', JSON.stringify(posts, null, 2))
}

fetchById()
