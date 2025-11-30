const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: '2f93fcy8',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
})

async function checkCSA() {
  const query = `*[_type == "post" && "company-sponsored" in categories[]->slug.current] {
    title,
    slug,
    "categories": categories[]->slug.current
  }`
  const posts = await client.fetch(query)
  console.log('CSA Posts:', JSON.stringify(posts, null, 2))
}

checkCSA()
