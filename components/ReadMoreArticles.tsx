import Link from 'next/link'
import { client, urlFor } from '@/lib/sanity'
import { getArticleUrl } from '@/lib/urls'
import OptimizedImage from './OptimizedImage'
import { Post } from '@/lib/types'

async function getRandomArticles(currentPostId: string): Promise<Post[]> {
    // Fetch a pool of recent articles (e.g., last 50) to pick random ones from
    const query = `*[_type == "post" && _id != $currentPostId && defined(mainImage.asset) && isHidden != true] | order(publishedAt desc) [0...50] {
        _id,
        title,
        slug,
        publishedAt,
        readTime,
        mainImage,
        "categories": categories[]->{title, slug}
    }`

    try {
        const articles = await client.fetch(query, { currentPostId }, { next: { revalidate: 600 } })

        if (!articles || articles.length === 0) return []

        // Shuffle array using Fisher-Yates algorithm
        const shuffled = [...articles]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled.slice(0, 3)
    } catch (e) {
        console.error('Error fetching random articles:', e)
        return []
    }
}

export default async function ReadMoreArticles({ currentPostId }: { currentPostId: string }) {
    const articles = await getRandomArticles(currentPostId)

    if (!articles || articles.length === 0) {
        return null
    }

    return (
        <section className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-12 border-t border-gray-200 mt-12">
            <h2 className="text-2xl font-bold text-[#111827] mb-8 uppercase tracking-wide">
                Read More Articles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {articles.map((article) => (
                    <Link
                        href={getArticleUrl(article)}
                        key={article._id}
                        className="group flex flex-col h-full"
                    >
                        <div className="relative w-full aspect-[16/9] mb-4 overflow-hidden rounded-lg bg-gray-100">
                            {article.mainImage ? (
                                <OptimizedImage
                                    src={urlFor(article.mainImage).width(600).height(338).url()}
                                    alt={article.mainImage.alt || article.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <span className="text-4xl">?</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col flex-grow">
                            {article.categories && article.categories.length > 0 && (
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                                    {article.categories[0].title}
                                </span>
                            )}

                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors line-clamp-2">
                                {article.title}
                            </h3>

                            <div className="mt-auto flex items-center text-sm text-gray-500">
                                {article.readTime && (
                                    <span>{article.readTime} min read</span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
