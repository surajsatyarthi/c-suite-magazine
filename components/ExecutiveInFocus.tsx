import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'

type ExecutiveInFocusProps = {
    image: string
    title: string
    position?: string
    href: string
    description?: string
}

export default function ExecutiveInFocus({ image, title, position, href, description }: ExecutiveInFocusProps) {
    return (
        <section className="py-16 bg-gradient-to-br from-[#2b6cb0] to-[#020f1a] text-white dark-section">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold !text-white heading-premium">
                        Executive in Focus
                    </h2>
                </div>

                <div className="flex flex-col items-center">
                    {/* Image Section - Standalone with subtle shadow */}
                    <div className="relative w-full max-w-sm aspect-[2/3] rounded-lg overflow-hidden shadow-2xl mb-10 border border-white/10">
                        <OptimizedImage
                            src={image}
                            alt={title}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-700"
                            priority
                        />
                    </div>

                    {/* Content Section - Clean text on dark background */}
                    <div className="text-center max-w-3xl">
                        <h3 className="text-4xl md:text-6xl font-serif font-bold !text-white mb-4 leading-tight uppercase tracking-wide article-title">
                            {title}
                        </h3>

                        {position && (
                            <p className="text-sm md:text-base text-[#c8ab3d] mb-6 font-bold tracking-[0.2em] uppercase">
                                {position}
                            </p>
                        )}

                        {description && (
                            <p className="text-2xl md:text-4xl font-serif italic !text-white mb-10 leading-tight">
                                {description}
                            </p>
                        )}

                        <Link
                            href={href}
                            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 tracking-wider uppercase text-sm"
                        >
                            Read Exclusive Interview
                            <svg className="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
