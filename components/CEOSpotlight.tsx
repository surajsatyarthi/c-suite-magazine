import Image from 'next/image'
import Link from 'next/link'

export default function CEOSpotlight() {
  const featuredCEO = {
    name: "Jennifer Martinez",
    title: "CEO & Chairman",
    company: "TechVision Global",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop",
    quote: "Innovation isn't about having all the answers—it's about asking the right questions and empowering your team to find solutions.",
    achievements: [
      "Led $2.5B digital transformation",
      "Named Fortune's Top 50 Most Powerful Women",
      "Grew company from $100M to $1.2B in 5 years"
    ],
    articleSlug: "#"
  }

  return (
    <section className="dark-section py-20 bg-gradient-to-br from-[#082945] via-[#0a3350] to-[#082945] text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-[#c8ab3d] text-white text-sm font-bold rounded-full mb-4">
            ⭐ FEATURED CEO SPOTLIGHT
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-black text-white mb-3">
            Executive of the Month
          </h2>
          <p className="text-xl text-gray-300">
            Meet the visionary leader shaping the future of business
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Image Side */}
              <div className="relative h-96 lg:h-auto">
                <Image
                  src={featuredCEO.image}
                  alt={featuredCEO.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:bg-gradient-to-r" />
              </div>

              {/* Content Side */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
                  {featuredCEO.name}
                </h3>
                <p className="text-xl text-[#c8ab3d] font-semibold mb-2">
                  {featuredCEO.title}
                </p>
                <p className="text-lg text-gray-300 mb-6">
                  {featuredCEO.company}
                </p>

                <blockquote className="border-l-4 border-[#c8ab3d] pl-6 mb-8">
                  <p className="text-lg italic text-gray-200 leading-relaxed">
                    "{featuredCEO.quote}"
                  </p>
                </blockquote>

                <div className="mb-8">
                  <h4 className="text-sm font-bold text-[#c8ab3d] uppercase tracking-wide mb-4">
                    Key Achievements
                  </h4>
                  <ul className="space-y-3">
                    {featuredCEO.achievements.map((achievement, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-200">
                        <svg className="w-5 h-5 text-[#c8ab3d] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={featuredCEO.articleSlug}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#c8ab3d] text-white font-bold rounded-lg hover:bg-[#b39a35] transition-colors group"
                >
                  Read Full Interview
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
