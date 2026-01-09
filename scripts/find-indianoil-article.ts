import { client } from '@/lib/sanity'

async function findArticle() {
  // Search for articles with Indian Oil or Vaidya in title
  const results = await client.fetch(`
    *[_type == "post" && (
      title match "*Indian*" ||
      title match "*Vaidya*" ||
      title match "*IndianOil*"
    )] {
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      "categorySlug": categories[0]->slug.current
    } | order(publishedAt desc)
  `)
  
  console.log('Found articles matching search:')
  console.log(JSON.stringify(results, null, 2))
}

findArticle().then(() => process.exit(0))
