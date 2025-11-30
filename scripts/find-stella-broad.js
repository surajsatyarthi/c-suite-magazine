const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: '2f93fcy8',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
})

async function findStellaBroad() {
  const query = `*[title match "*Stella*"] {
    _type,
    title,
    slug
  }`
  const posts = await client.fetch(query)
  console.log('Stella Broad Posts:', JSON.stringify(posts, null, 2))
}

findStellaBroad()
