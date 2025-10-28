'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function ParallaxHero() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden">
      {/* Parallax Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
          willChange: 'transform'
        }}
      >
        <Image
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop"
          alt="Modern business cityscape"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#082945]/95 via-[#0a3350]/90 to-[#082945]/95" />
        
        {/* Animated pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="max-w-4xl mx-auto text-center"
            style={{
              transform: `translateY(${scrollY * 0.2}px)`,
              opacity: Math.max(1 - scrollY / 500, 0),
              willChange: 'transform, opacity'
            }}
          >
            {/* Small badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#c8ab3d]/20 border border-[#c8ab3d]/40 rounded-full text-[#c8ab3d] text-sm font-semibold mb-6 backdrop-blur-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Trusted by 50,000+ Executives Worldwide
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black mb-6 leading-tight text-white">
              Leadership.<br />
              <span className="text-[#c8ab3d]">Innovation.</span><br />
              Excellence.
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-200 mb-10 leading-relaxed max-w-3xl mx-auto font-light">
              Exclusive insights and strategies for global executives and business leaders
            </p>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-6 md:gap-12 mt-16 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-5xl font-serif font-bold text-[#c8ab3d] mb-2">500+</div>
                <div className="text-sm md:text-base text-gray-300">Expert Articles</div>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="text-3xl md:text-5xl font-serif font-bold text-[#c8ab3d] mb-2">50K+</div>
                <div className="text-sm md:text-base text-gray-300">Readers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-5xl font-serif font-bold text-[#c8ab3d] mb-2">100+</div>
                <div className="text-sm md:text-base text-gray-300">Contributors</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
