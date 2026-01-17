import { client, urlFor } from '@/lib/sanity'
import { Writer } from '@/lib/types'
import OptimizedImage from './OptimizedImage'
import Link from 'next/link'

async function getGuestAuthors() {
    const query = `*[_type == "writer" && writerType == "guest"] | order(_createdAt desc) [0...8] {
      _id,
      name,
      position,
      image,
      slug
    }`

    try {
        return await client.fetch(query, {}, { next: { revalidate: 0 } })
    } catch (e) {
        console.error('Error fetching guest authors:', e)
        return []
    }
}

export default async function GuestAuthors() {
    const authors = await getGuestAuthors()

    if (!authors || authors.length === 0) {
        return null
    }

    return (
        <section className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-serif font-black text-gray-900 mb-4 heading-premium">
                    Guest Writers
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                {authors.map((author: any) => (
                    <Link
                        href={`/author/${author.slug.current}`}
                        key={author._id}
                        className="group h-full"
                    >
                        <div className="h-full flex flex-col items-center text-center bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                            <div className="relative w-24 h-24 mb-4 overflow-hidden rounded-full border-2 border-gray-100 group-hover:border-blue-100 transition-colors">
                                {author.image ? (
                                    <OptimizedImage
                                        src={urlFor(author.image).width(256).height(256).url()}
                                        alt={author.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 96px, 96px"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                                        <span className="text-3xl">?</span>
                                    </div>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                                {author.name}
                            </h3>

                            {author.position && (
                                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                                    {author.position}
                                </p>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
