import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function ArchivePage() {
  const issues = [
    {
      id: 1,
      title: "Innovation Leaders 2025",
      date: "January 2025",
      views: 45200,
      cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
      description: "Featuring the top innovators transforming industries worldwide",
      featured: ["Tech Disruption", "AI Revolution", "Green Energy"]
    },
    {
      id: 2,
      title: "Women in Leadership",
      date: "December 2024",
      views: 38500,
      cover: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=600&fit=crop",
      description: "Celebrating women CEOs breaking barriers and redefining success",
      featured: ["Female CEOs", "Glass Ceiling", "Diversity"]
    },
    {
      id: 3,
      title: "Sustainable Business",
      date: "November 2024",
      views: 42100,
      cover: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=600&fit=crop",
      description: "How leading companies balance profit with environmental responsibility",
      featured: ["ESG", "Carbon Neutral", "Green Finance"]
    },
    {
      id: 4,
      title: "Global Expansion",
      date: "October 2024",
      views: 35800,
      cover: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=600&fit=crop",
      description: "Strategies for scaling businesses across international markets",
      featured: ["International Growth", "Market Entry", "Global Strategy"]
    },
    {
      id: 5,
      title: "Digital Transformation",
      date: "September 2024",
      views: 39700,
      cover: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=600&fit=crop",
      description: "Leading companies through the digital revolution",
      featured: ["Cloud Migration", "Digital Strategy", "Tech Investment"]
    },
    {
      id: 6,
      title: "Financial Excellence",
      date: "August 2024",
      views: 33400,
      cover: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=600&fit=crop",
      description: "CFO insights on navigating economic uncertainty",
      featured: ["Financial Strategy", "Risk Management", "Investment"]
    },
    {
      id: 7,
      title: "Startup Unicorns",
      date: "July 2024",
      views: 41900,
      cover: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=600&fit=crop",
      description: "The founders building billion-dollar companies",
      featured: ["Unicorn Startups", "Venture Capital", "Scale-up"]
    },
    {
      id: 8,
      title: "Healthcare Innovation",
      date: "June 2024",
      views: 37200,
      cover: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=600&fit=crop",
      description: "Medical technology leaders revolutionizing patient care",
      featured: ["MedTech", "Digital Health", "Biotech"]
    },
    {
      id: 9,
      title: "Manufacturing 4.0",
      date: "May 2024",
      views: 31800,
      cover: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=600&fit=crop",
      description: "Smart factories and the future of production",
      featured: ["Industry 4.0", "Automation", "IoT"]
    }
  ]

  return (
    <>
      <Navigation />
      
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="dark-section bg-gradient-to-br from-[#082945] via-[#0a3350] to-[#082945] text-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-serif font-black mb-4 text-white">
              Magazine Archive
            </h1>
            <p className="text-xl text-white max-w-2xl mx-auto">
              Explore our collection of exclusive issues featuring the world's top executives
            </p>
          </div>
        </div>

        {/* Archive Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="relative h-96 overflow-hidden bg-gray-200">
                  <Image
                    src={issue.cover}
                    alt={issue.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-[#c8ab3d] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    {(issue.views / 1000).toFixed(1)}K
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2 group-hover:text-[#082945] transition-colors">
                    {issue.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {issue.description}
                  </p>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Featured Topics:</p>
                    <div className="flex flex-wrap gap-2">
                      {issue.featured.map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-[#082945] to-[#0a3a5c] rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-serif font-bold mb-4">
              Never Miss an Issue
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Get the latest insights from top executives delivered directly to your inbox
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-[#c8ab3d] text-white font-bold rounded-lg hover:bg-[#b39a35] transition-colors"
            >
              Subscribe Now
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
