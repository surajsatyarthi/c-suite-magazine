const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: '2f93fcy8',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
})

async function findStella() {
  const query = `*[title match "Stella*"] {
    _type,
    title,
    slug,
    "categories": categories[]->slug.current
  }`
  const posts = await client.fetch(query)
  console.log('Stella Posts:', JSON.stringify(posts, null, 2))
}

findStella()
