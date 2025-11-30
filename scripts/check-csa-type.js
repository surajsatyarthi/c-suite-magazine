const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: '2f93fcy8',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
})

async function checkCSAType() {
  const query = `*[_type == "csa"] {
    title,
    slug,
    "categories": categories[]->slug.current
  }`
  const posts = await client.fetch(query)
  console.log('CSA Type Posts:', JSON.stringify(posts, null, 2))
}

checkCSAType()
