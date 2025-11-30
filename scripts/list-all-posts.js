const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: '2f93fcy8',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
})

async function listAll() {
  const query = `*[_type in ["post", "csa"]] { title, slug }`
  const posts = await client.fetch(query)
  console.log(JSON.stringify(posts, null, 2))
}

listAll()
