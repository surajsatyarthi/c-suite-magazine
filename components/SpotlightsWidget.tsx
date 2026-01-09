import Link from 'next/link'
import { client, urlFor } from '@/lib/sanity'
import OptimizedImage from './OptimizedImage'

interface SpotlightLeader {
  name: string
  position?: string
  company?: string
  achievement: string
  image: any
  profileUrl: string
}

async function getSpotlightLeaders(): Promise<SpotlightLeader[]> {
  const query = `*[_type == "post" 
    && "cxo-interview" in categories[]->slug.current
    && defined(writer)
    && defined(writer->image)
  ] | order(publishedAt desc)[0...5] {
    "name": writer->name,
    "position": writer->position,
    "company": coalesce(writer->company, ""),
    "image": writer->image,
    "achievement": coalesce(excerpt[0...80], title[0...80]),
    "profileUrl": "/writer/" + writer->slug.current,
    publishedAt
  }`

  try {
    const leaders = await client.fetch(query, {}, { next: { revalidate: 600 } })
    return leaders || []
  } catch (error) {
    console.error('Error fetching spotlight leaders:', error)
    return []
  }
}

export default async function SpotlightsWidget() {
  const leaders = await getSpotlightLeaders()

  if (leaders.length === 0) {
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="font-serif text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-[#c8ab3d]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        Spotlights on Leaders
      </h3>

      <div className="space-y-4">
        {leaders.map((leader, index) => (
          <Link
            key={index}
            href={leader.profileUrl}
            className="block group"
          >
            <div className="flex gap-3">
              {/* Circular headshot */}
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                <OptimizedImage
                  src={urlFor(leader.image).width(96).height(96).auto('format').url()}
                  alt={leader.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Leader info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-sans text-sm font-bold text-gray-900 group-hover:text-[#082945] transition-colors">
                  {leader.name}
                </h4>
                {(leader.position || leader.company) && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    {[leader.position, leader.company].filter(Boolean).join(', ')}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {leader.achievement}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
