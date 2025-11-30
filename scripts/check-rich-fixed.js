const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: '2f93fcy8',
  dataset: 'production-fixed',
  apiVersion: '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN
})

async function checkRichFixed() {
  const query = `*[_type == "csa" && title match "Rich*"] { title, slug }`
  const posts = await client.fetch(query)
  console.log('Rich in Fixed:', JSON.stringify(posts, null, 2))
}

checkRichFixed()
