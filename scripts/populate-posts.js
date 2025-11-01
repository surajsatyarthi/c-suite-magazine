const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function uploadImageFromUrl(url, filenameHint = 'image.jpg') {
  const res = await fetch(url)
  const buffer = Buffer.from(await res.arrayBuffer())
  const asset = await client.assets.upload('image', buffer, { filename: filenameHint })
  return asset
}

function textBlock(text) {
  return {
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', text }],
  }
}

async function getAuthorRefBySlug(slug) {
  const author = await client.fetch('*[_type == "author" && slug.current == $slug][0]{ _id }', { slug })
  if (!author?._id) throw new Error(`Author not found for slug ${slug}`)
  return { _type: 'reference', _ref: author._id }
}

async function getCategoryRefs(slugs) {
  const cats = await client.fetch('*[_type == "category" && slug.current in $slugs]{ _id, slug }', { slugs })
  return cats.map(c => ({ _type: 'reference', _ref: c._id }))
}

const posts = [
  {
    title: 'The Future of Leadership in a Digital World',
    excerpt: 'How modern CEOs adapt leadership styles for digital transformation and remote work.',
    authorSlug: 'sarah-johnson',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop',
    imageAlt: 'Team of business leaders in a modern office setting',
    categories: ['leadership'],
    readTime: 6,
    body: [
      textBlock('Digital transformation is redefining leadership across every industry.'),
      textBlock('Executives must balance agility, empathy, and data-driven decision making.'),
    ],
  },
  {
    title: 'Innovation Strategies from Fortune 500 Companies',
    excerpt: 'Insights into how top companies foster cultures of innovation.',
    authorSlug: 'michael-chen',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=800&fit=crop',
    imageAlt: 'Innovative technology and collaboration',
    categories: ['innovation'],
    readTime: 7,
    body: [
      textBlock('Innovation thrives where leadership encourages experimentation.'),
      textBlock('Fortune 500 companies invest in cross-functional teams and rapid prototyping.'),
    ],
  },
  {
    title: 'Sustainable Business Practices That Drive Profit',
    excerpt: 'Balancing environmental responsibility with financial success.',
    authorSlug: 'emma-williams',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&h=800&fit=crop',
    imageAlt: 'Green sustainable business environment',
    categories: ['sustainability'],
    readTime: 5,
    body: [
      textBlock('Sustainability is now a core business driver, not a side initiative.'),
      textBlock('ESG-aligned strategies can unlock new growth and investor confidence.'),
    ],
  },
  {
    title: 'Financial Strategies for Hypergrowth Startups',
    excerpt: 'Proven approaches to funding, budgeting, and risk for fast-scaling ventures.',
    authorSlug: 'raj-patel',
    imageUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&h=800&fit=crop',
    imageAlt: 'Financial charts and growth metrics',
    categories: ['startups', 'money-finance'],
    readTime: 6,
    body: [
      textBlock('Startups succeed when finance operations scale alongside product and sales.'),
      textBlock('Scenario planning is essential to navigate volatile markets.'),
    ],
  },
  {
    title: 'AI and Digital Transformation in the Enterprise',
    excerpt: 'How AI reshapes operations, customer experience, and executive decision-making.',
    authorSlug: 'alicia-gomez',
    imageUrl: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=1200&h=800&fit=crop',
    imageAlt: 'AI visualization and enterprise technology',
    categories: ['science-technology', 'innovation'],
    readTime: 8,
    body: [
      textBlock('AI is a strategic lever for competitive advantage.'),
      textBlock('Executives should align AI initiatives with measurable business outcomes.'),
    ],
  },
]

async function populatePosts() {
  console.log('Starting to populate posts...')

  for (const p of posts) {
    try {
      const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const authorRef = await getAuthorRefBySlug(p.authorSlug)
      const categoryRefs = await getCategoryRefs(p.categories)
      const asset = await uploadImageFromUrl(p.imageUrl, `${slug}.jpg`)

      const doc = {
        _type: 'post',
        title: p.title,
        slug: { _type: 'slug', current: slug },
        excerpt: p.excerpt,
        author: authorRef,
        mainImage: { _type: 'image', asset: { _type: 'reference', _ref: asset._id }, alt: p.imageAlt },
        categories: categoryRefs,
        isFeatured: false,
        readTime: p.readTime,
        body: p.body,
        seo: { metaTitle: p.title, metaDescription: p.excerpt },
      }

      const created = await client.create(doc)
      console.log(`✓ Created post: ${p.title}`)
    } catch (error) {
      console.error(`✗ Failed to create post ${p.title}:`, error.message)
    }
  }

  console.log('\nDone! Posts have been populated.')
}

populatePosts()

