const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: '2f93fcy8',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
})

async function findStellaSlug() {
  const slug = 'stella-ambrose-visionary-trailblazer-in-sustainable-palm-oil-leadership'
  const query = `*[slug.current == $slug] {
    _type,
    title,
    slug,
    "categories": categories[]->slug.current
  }`
  const posts = await client.fetch(query, { slug })
  console.log('Stella Slug Posts:', JSON.stringify(posts, null, 2))
}

findStellaSlug()
