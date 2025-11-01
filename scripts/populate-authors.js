const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function uploadImageFromUrl(url) {
  const res = await fetch(url)
  const buffer = Buffer.from(await res.arrayBuffer())
  const asset = await client.assets.upload('image', buffer, { filename: url.split('?')[0].split('/').pop() || 'author.jpg' })
  return asset
}

const authors = [
  {
    name: 'Maya Whitfield',
    position: 'Editor-at-Large',
    imageUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5a02?w=600&h=600&fit=crop',
    bio: 'Maya covers global leadership trends and boardroom dynamics. She blends investigative rigor with practical insights for executives navigating transformation.',
    social: { twitter: 'https://twitter.com/mayawhitfield', linkedin: 'https://www.linkedin.com/in/mayawhitfield', website: 'https://mayawhitfield.com' },
  },
  {
    name: 'Arjun Mehta',
    position: 'Chief Technology Commentator',
    imageUrl: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=600&h=600&fit=crop',
    bio: 'Arjun writes on AI strategy, data platforms, and enterprise digital transformation, advising executives on building durable, tech-forward operating models.',
    social: { twitter: 'https://twitter.com/arjunmehta', linkedin: 'https://www.linkedin.com/in/arjunmehta', website: 'https://arjunmehta.dev' },
  },
  {
    name: 'Elena Petrov',
    position: 'Strategy & Risk Analyst',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop',
    bio: 'Elena focuses on corporate resilience, scenario planning, and crisis leadership. Her work helps boards align risk appetite with growth ambitions.',
    social: { twitter: 'https://twitter.com/elenapetrov', linkedin: 'https://www.linkedin.com/in/elenapetrov', website: 'https://elenapetrov.co' },
  },
  {
    name: 'David Okoro',
    position: 'Global Markets Correspondent',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=600&fit=crop',
    bio: 'David reports on emerging markets, capital allocation, and governance. He highlights how leadership choices shape long-term value creation.',
    social: { twitter: 'https://twitter.com/davidokoro', linkedin: 'https://www.linkedin.com/in/davidokoro', website: 'https://davidokoro.com' },
  },
  {
    name: 'Linh Nguyen',
    position: 'Operations & Culture Editor',
    imageUrl: 'https://images.unsplash.com/photo-1546525848-3ce03ca516f6?w=600&h=600&fit=crop',
    bio: 'Linh writes about organizational design, performance systems, and culture change—turning strategy into repeatable operating discipline.',
    social: { twitter: 'https://twitter.com/linhnguyen', linkedin: 'https://www.linkedin.com/in/linhnguyen', website: 'https://linhnguyen.work' },
  },
  {
    name: 'Carlos Mendes',
    position: 'Innovation & Product Columnist',
    imageUrl: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=600&h=600&fit=crop',
    bio: 'Carlos explores how product thinking, customer insight, and rapid experimentation fuel innovation at scale in complex enterprises.',
    social: { twitter: 'https://twitter.com/carlosmendes', linkedin: 'https://www.linkedin.com/in/carlosmendes', website: 'https://carlosmendes.io' },
  },
  {
    name: 'Priya Raman',
    position: 'Finance & Growth Writer',
    imageUrl: 'https://images.unsplash.com/photo-1524608345308-1e8c1c6f82b8?w=600&h=600&fit=crop',
    bio: 'Priya covers capital strategy, investor relations, and CFO leadership—connecting disciplined financial execution to sustainable growth.',
    social: { twitter: 'https://twitter.com/priyaraman', linkedin: 'https://www.linkedin.com/in/priyaraman', website: 'https://priyaraman.finance' },
  },
  {
    name: 'Sofia Alvarez',
    position: 'Customer & Brand Strategist',
    imageUrl: 'https://images.unsplash.com/photo-1544435250-8caafdb50172?w=600&h=600&fit=crop',
    bio: 'Sofia analyzes customer experience, brand differentiation, and growth ecosystems—helping leaders connect positioning with execution.',
    social: { twitter: 'https://twitter.com/sofiaalvarez', linkedin: 'https://www.linkedin.com/in/sofiaalvarez', website: 'https://sofiaalvarez.co' },
  },
  {
    name: 'Martin Kessler',
    position: 'Technology & Policy Writer',
    imageUrl: 'https://images.unsplash.com/photo-1546525848-3ce03ca516f6?w=600&h=600&fit=crop',
    bio: 'Martin covers tech regulation, data ethics, and platform strategy—clarifying how policy and innovation intersect for the C-suite.',
    social: { twitter: 'https://twitter.com/martinkessler', linkedin: 'https://www.linkedin.com/in/martinkessler', website: 'https://martinkessler.net' },
  },
  {
    name: 'Aisha Farouk',
    position: 'People & Leadership Editor',
    imageUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&h=600&fit=crop',
    bio: 'Aisha focuses on executive coaching, talent strategy, and inclusive leadership—turning principles into measurable outcomes.',
    social: { twitter: 'https://twitter.com/aishafarouk', linkedin: 'https://www.linkedin.com/in/aishafarouk', website: 'https://aishafarouk.com' },
  },
]

function textBlock(text) {
  return {
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', text }],
  }
}

async function populateAuthors() {
  console.log('Starting to populate authors...')

  for (const a of authors) {
    try {
      const slug = a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      let asset = null
      try {
        asset = await uploadImageFromUrl(a.imageUrl)
      } catch (imgErr) {
        console.warn(`Image upload failed for ${a.name}, proceeding without headshot:`, imgErr?.message || imgErr)
      }

      const doc = {
        _id: `author-${slug}`,
        _type: 'author',
        name: a.name,
        slug: { _type: 'slug', current: slug },
        position: a.position,
        ...(asset ? { image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } } : {}),
        bio: [textBlock(a.bio)],
        social: a.social,
      }

      await client.createIfNotExists(doc)
      console.log(`✓ Created author: ${a.name}`)
    } catch (error) {
      console.error(`✗ Failed to create author ${a.name}:`, error.message)
    }
  }

  console.log('\nDone! Authors have been populated.')
}

populateAuthors()
