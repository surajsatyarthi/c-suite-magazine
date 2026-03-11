import { notFound, redirect } from 'next/navigation'
import { createClient } from 'next-sanity'

// Minimalistic emergency client to avoid server-only/dependency locks
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-02-05',
  useCdn: false,
})

// Enable ISR (Incremental Static Regeneration) with 10-minute revalidation
// Articles rarely change after publish — revalidate once per day to reduce ISR writes
export const revalidate = 86400

// Allow dynamic params to be rendered on-demand (not just build-time paths)
// Without this, Next.js will return 404 for a slug not in generateStaticParams
export const dynamicParams = true

export default async function ArticleRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // 🛡️ EMERGENCY LOOKUP: Find the document across both types
  const query = `*[( _type == "post" || _type == "csa" ) && slug.current == $slug][0]{
    _type,
    "categorySlug": categories[0]->slug.current
  }`

  try {
    const doc = await client.fetch(query, { slug })

    if (!doc) {
      console.error(`[EMERGENCY-REDIRECT] No document found for slug: ${slug}`)
      notFound()
    }

    if (doc._type === 'csa') {
      // 301 Permanent Redirect for SEO recovery
      redirect(`/csa/${slug}`)
    } else {
      const cat = doc.categorySlug || 'leadership'
      redirect(`/category/${cat}/${slug}`)
    }
  } catch (error) {
    console.error(`[EMERGENCY-REDIRECT] System failure for slug: ${slug}`, error)
    notFound()
  }
}
