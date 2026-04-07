import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Breadcrumbs from '@/components/Breadcrumbs'
import { getServerClient } from '@/lib/sanity.server'
import { draftMode } from 'next/headers'
import type { Metadata } from 'next'
import Link from 'next/link'
import { normalizeDisplayTag } from '@/lib/tag-utils'

// Revalidate once per week — deployment flushes cache on every publish
export const revalidate = 604800

export const metadata: Metadata = {
  title: 'Industry Tags | C-Suite Magazine',
  description: 'Browse all industry topics, executive insights, and strategic categories featured in C-Suite Magazine.',
}

async function getAllUniqueTags(): Promise<string[]> {
  const { isEnabled } = await draftMode();
  const previewToken = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN;
  const query = `*[_type in ["post", "csa"] && defined(tags)].tags`
  const client = getServerClient(isEnabled ? previewToken : undefined)
  const allTagsArrays: string[][] = await client.fetch(query)
  
  // Flatten, Normalize, Dedupe
  const uniqueTags = new Set<string>()
  
  allTagsArrays.forEach(tags => {
    tags.forEach(tag => {
      // We use the normalized version for uniqueness but display what we find (or normalized)
      // Actually, let's store the raw tag but rely on normalization for sorting/uniq?
      // Issue #8 Says we have "Consolidated Taxonomy", so tags should be clean.
      if (tag && tag.length >= 2) { 
        uniqueTags.add(tag.trim())
      }
    })
  })

  // Sort Alphabetically
  return Array.from(uniqueTags).sort((a, b) => 
    a.toLowerCase().localeCompare(b.toLowerCase())
  )
}

export default async function TagIndexPage() {
  const tags = await getAllUniqueTags()

  // Group by First Letter for better UX
  const groupedTags: Record<string, string[]> = {}
  tags.forEach(tag => {
    const firstLetter = tag.charAt(0).toUpperCase()
    // Group 0-9 into '#'
    const key = /[0-9]/.test(firstLetter) ? '#' : firstLetter
    if (!groupedTags[key]) groupedTags[key] = []
    groupedTags[key].push(tag)
  })

  const sortedKeys = Object.keys(groupedTags).sort()

  return (
    <>
      <Navigation />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'All Tags' }]} />

      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="dark-section bg-[#082945] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-black mb-4">
              Industry Topics
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Explore our complete index of executive insights, organized by topic.
            </p>
          </div>
        </div>

        {/* Tag Grid */}
        <div className="container mx-auto px-4 py-12">
          {tags.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p>No tags found.</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-12">
               {sortedKeys.map(letter => (
                 <div key={letter} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                   <h2 className="text-2xl font-bold text-[#082945] mb-6 border-b pb-2">
                     {letter}
                   </h2>
                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                     {groupedTags[letter].map(tag => {
                       const slug = tag.toLowerCase().replace(/\s+/g, '-')
                       return (
                         <Link 
                           key={tag}
                           href={`/tag/${slug}`}
                           className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 hover:border-blue-200"
                         >
                           <span className="text-gray-700 font-medium group-hover:text-blue-700">
                             {normalizeDisplayTag(tag)}
                           </span>
                           <span className="text-gray-300 group-hover:text-blue-400">
                             →
                           </span>
                         </Link>
                       )
                     })}
                   </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
