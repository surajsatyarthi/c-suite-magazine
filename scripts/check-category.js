const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: '2f93fcy8',
  dataset: 'production-fixed',
  apiVersion: '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN
})

async function checkCategory() {
  const id = 'CLZyEnOmHFQ0HoyBtIU3xy'
  const query = `*[_id == $id] { title, slug }`
  const cat = await client.fetch(query, { id })
  console.log('Category:', JSON.stringify(cat, null, 2))
}

checkCategory()
