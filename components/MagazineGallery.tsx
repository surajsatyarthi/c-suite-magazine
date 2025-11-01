import OptimizedImage from '@/components/OptimizedImage'
import Link from 'next/link'

export default function MagazineGallery() {
  const covers = [
    {
      id: 1,
      title: "Innovation Leaders 2025",
      issue: "January 2025",
      views: 2500000,
      image: "/featured-issue-1.png"
    },
    {
      id: 2,
      title: "Women in Leadership",
      issue: "December 2024",
      views: 1800000,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=600&fit=crop"
    },
    {
      id: 3,
      title: "Sustainable Business",
      issue: "November 2024",
      views: 2200000,
      image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=600&fit=crop"
    },
    {
      id: 4,
      title: "Global Expansion",
      issue: "October 2024",
      views: 1500000,
      image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=600&fit=crop"
    },
    {
      id: 5,
      title: "Digital Transformation",
      issue: "September 2024",
      views: 1900000,
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=600&fit=crop"
    },
    {
      id: 6,
      title: "Financial Excellence",
      issue: "August 2024",
      views: 1300000,
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=600&fit=crop"
    },
    {
      id: 7,
      title: "Startup Unicorns",
      issue: "July 2024",
      views: 2100000,
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=600&fit=crop"
    },
    {
      id: 8,
      title: "Healthcare Innovation",
      issue: "June 2024",
      views: 1700000,
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=600&fit=crop"
    },
    {
      id: 9,
      title: "Manufacturing 4.0",
      issue: "May 2024",
      views: 1400000,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=600&fit=crop"
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-black text-gray-900 mb-4 heading-premium">
            Featured Issues
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse our collection of exclusive issues featuring the world's top executives
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {covers.map((cover) => (
            <Link
              key={cover.id}
              href="/archive"
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 card-hover-scale"
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-gray-200">
                <OptimizedImage
                  src={cover.image}
                  alt={cover.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* View Count Badge - Top Right */}
                <div className="absolute top-4 right-4 bg-[#c8ab3d] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {(cover.views / 1000000).toFixed(1)}M
                </div>
                
                {/* Strong dark overlay on hover for text readability */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Title Overlay - Only visible on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                  <h3 className="font-serif font-bold text-xl mb-2" style={{ color: '#ffffff' }}>
                    {cover.title}
                  </h3>
                  <p className="text-sm" style={{ color: '#ffffff' }}>
                    View Issue →
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/archive"
            prefetch
            className="inline-block px-8 py-4 bg-[#082945] text-white font-bold rounded-lg hover:bg-[#0a3a5c] transition-colors btn-shimmer focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2"
          >
            Read More
          </Link>
        </div>
      </div>
    </section>
  )
}
