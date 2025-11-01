"use client"

import OptimizedImage from '@/components/OptimizedImage'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'

export default function CEOSpotlight() {
  const carouselRef = useRef<HTMLDivElement | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const spotlights = [
    {
      name: "Jennifer Martinez",
      title: "CEO & Chairman",
      company: "TechVision Global",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=800&fit=crop",
      quote: "Innovation isn't about having all the answers—it's about asking the right questions and empowering your team to find solutions.",
      achievements: [
        "Led $2.5B digital transformation",
        "Named Fortune's Top 50 Most Powerful Women",
        "Grew company from $100M to $1.2B in 5 years"
      ],
      articleSlug: "#"
    },
    {
      name: "Ava Thompson",
      title: "CEO",
      company: "Horizon Dynamics",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&h=800&fit=crop",
      quote: "Great leadership is clarity of vision paired with relentless execution.",
      achievements: [
        "Expanded operations to 35 countries",
        "Drove 45% YoY revenue growth",
        "Built a culture of continuous innovation"
      ],
      articleSlug: "#"
    },
    {
      name: "Liam Rodriguez",
      title: "CFO",
      company: "Summit Capital",
      image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=1200&h=800&fit=crop",
      quote: "Financial discipline enables bold strategic decisions.",
      achievements: [
        "Raised $1.8B across multi-stage funds",
        "Implemented AI-powered risk modeling",
        "Improved margins by 12%"
      ],
      articleSlug: "#"
    },
    {
      name: "Sophia Nguyen",
      title: "CTO",
      company: "NovaTech Systems",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&h=800&fit=crop&auto=format&dpr=2",
      quote: "Technology serves people when simplicity meets scale.",
      achievements: [
        "Migrated 200+ services to microservices",
        "Cut cloud spend by 30%",
        "Launched 3 flagship platforms"
      ],
      articleSlug: "#"
    },
    {
      name: "Ethan Patel",
      title: "COO",
      company: "GlobalWorks",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200&h=800&fit=crop",
      quote: "Operational excellence is a competitive advantage.",
      achievements: [
        "Optimized supply chain across 42 hubs",
        "Reduced cycle time by 25%",
        "Achieved ISO 27001 compliance"
      ],
      articleSlug: "#"
    }
  ]

  // Handle keyboard navigation for carousel
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      navigatePrevious()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      navigateNext()
    } else if (e.key === 'Home') {
      e.preventDefault()
      navigateToSlide(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      navigateToSlide(spotlights.length - 1)
    }
  }

  const navigatePrevious = () => {
    const el = carouselRef.current
    if (!el) return
    const width = el.clientWidth
    setActiveIndex((prev) => {
      const next = (prev - 1 + spotlights.length) % spotlights.length
      el.scrollTo({ left: next * width, behavior: 'smooth' })
      return next
    })
  }

  const navigateNext = () => {
    const el = carouselRef.current
    if (!el) return
    const width = el.clientWidth
    setActiveIndex((prev) => {
      const next = (prev + 1) % spotlights.length
      el.scrollTo({ left: next * width, behavior: 'smooth' })
      return next
    })
  }

  const navigateToSlide = (index: number) => {
    const el = carouselRef.current
    if (!el) return
    const width = el.clientWidth
    setActiveIndex(index)
    el.scrollTo({ left: index * width, behavior: 'smooth' })
  }

  // Auto-advance carousel every 3 seconds; pause on hover
  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    if (isHovered) return
    const id = setInterval(() => {
      navigateNext()
    }, 3000)
    return () => clearInterval(id)
  }, [spotlights.length, isHovered])

  return (
    <section 
      className="dark-section py-20 bg-gradient-to-br from-[#082945] via-[#0a3350] to-[#082945] text-white relative overflow-hidden"
      aria-labelledby="ceo-spotlight-heading"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 id="ceo-spotlight-heading" className="text-5xl font-serif font-black mb-4">
            CEO <span className="metallic-sheen">Spotlight</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Exclusive insights from visionary leaders shaping the future of business
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div 
            ref={carouselRef}
            className="flex overflow-x-hidden scroll-smooth"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onKeyDown={handleKeyDown}
            role="region"
            aria-label="CEO spotlight carousel"
            aria-live="polite"
            tabIndex={0}
          >
            {spotlights.map((spotlight, index) => (
              <div 
                key={index} 
                className="w-full flex-shrink-0 px-4"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${spotlights.length}`}
                aria-hidden={index !== activeIndex}
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                  <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <div className="relative">
                      <div className="aspect-[4/5] relative overflow-hidden rounded-xl">
                        <OptimizedImage
                          src={spotlight.image}
                          alt={`Portrait of ${spotlight.name}, ${spotlight.title} at ${spotlight.company}`}
                          fill
                          className="object-cover"
                          sizes="100vw"
                          priority={index === activeIndex}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-[#c8ab3d] rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-3xl font-serif font-bold mb-2">{spotlight.name}</h3>
                        <p className="text-[#c8ab3d] text-lg font-medium mb-1">{spotlight.title}</p>
                        <p className="text-gray-300">{spotlight.company}</p>
                      </div>
                      <blockquote className="text-xl italic text-gray-100 border-l-4 border-[#c8ab3d] pl-6">
                        "{spotlight.quote}"
                      </blockquote>
                      <div>
                        <h4 className="text-lg font-semibold mb-3 text-[#c8ab3d]">Key Achievements</h4>
                        <ul className="space-y-2" role="list">
                          {spotlight.achievements.map((achievement, idx) => (
                            <li key={idx} className="flex items-start gap-3" role="listitem">
                              <div className="w-2 h-2 bg-[#c8ab3d] rounded-full mt-2 flex-shrink-0" aria-hidden="true" />
                              <span className="text-gray-200">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        {spotlight.articleSlug !== "#" ? (
                          <Link 
                            href={`/article/${spotlight.articleSlug}`}
                            prefetch
                            className="btn-premium-gradient inline-flex items-center gap-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]"
                            aria-label={`Read full interview with ${spotlight.name}`}
                          >
                            <span>Read Full Interview</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </Link>
                        ) : (
                          <span 
                            className="btn-premium-gradient inline-flex items-center gap-2 rounded-lg cursor-not-allowed opacity-70"
                            aria-disabled="true"
                            aria-label={`Interview with ${spotlight.name} coming soon`}
                          >
                            <span>Read Full Interview</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={navigatePrevious}
              className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945] transition-colors"
              aria-label="Previous CEO spotlight"
            >
              <span aria-hidden="true">◀</span>
            </button>
            
            {/* Slide Indicators */}
            <div className="flex gap-2" role="tablist" aria-label="CEO spotlight slides">
              {spotlights.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => navigateToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945] ${
                    index === activeIndex 
                      ? 'bg-[#c8ab3d]' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  role="tab"
                  aria-selected={index === activeIndex}
                  aria-label={`Go to slide ${index + 1}: ${spotlights[index].name}`}
                />
              ))}
            </div>
            
            <button
              type="button"
              onClick={navigateNext}
              className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945] transition-colors"
              aria-label="Next CEO spotlight"
            >
              <span aria-hidden="true">▶</span>
            </button>
          </div>

          {/* Screen Reader Instructions */}
          <div className="sr-only">
            <p>Use arrow keys to navigate between CEO spotlights. Press Home to go to the first slide, End to go to the last slide.</p>
          </div>
        </div>

        {/* Single card removed; now using the carousel above */}
      </div>
    </section>
  )
}
