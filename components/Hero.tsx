
import OptimizedImage from '@/components/OptimizedImage'
import { urlFor } from '@/lib/sanity'

export default function Hero({ bannerImage }: { bannerImage?: any }) {
  // UAQS v2.2 Hardened: Ensure bannerImage is a valid Sanity image object before builder call
  const isValidImage = (img: any) => img && (img.asset || img._ref)
  const heroSrc = isValidImage(bannerImage) 
    ? urlFor(bannerImage).width(1920).height(1080).quality(90).auto('format').url() 
    : "/hero-image.webp"

  return (
    <section className="dark-section relative h-[600px] md:h-[700px] lg:h-[800px] bg-[#082945]">
      {/* Parallax Background Image */}
      <div 
        className="absolute inset-0 z-0"
      >
        <OptimizedImage
          src={heroSrc}
          alt="CEO Magazine Hero Image"
          fill
          className="object-cover"
          priority
          quality={75}
          placeholder="empty"
          sizes="100vw"
        />
        {/* Enhanced gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-0">
          <div 
            className="max-w-4xl mx-auto text-center"
          >
            {/* Small badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#c8ab3d]/20 border border-[#c8ab3d]/40 rounded-full text-white text-[1.05rem] font-semibold mb-6 backdrop-blur-sm">
              <svg className="w-[1.2rem] h-[1.2rem]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Leading Global C-Suite Magazine
            </div>

            {/* Headline + Subtitle in frosted card */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-4 md:p-6">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black mb-6 leading-tight heading-premium" style={{ color: '#ffffff', textShadow: '0 3px 8px rgba(0,0,0,0.75)' }}>
                Leadership<br />
                <span className="metallic-sheen metallic-sheen-strong">Innovation</span><br />
                Excellence
              </h1>

              <p className="text-xl md:text-2xl lg:text-3xl mb-2 md:mb-3 leading-relaxed max-w-3xl mx-auto font-semibold" style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                Exclusive insights and strategies for global executives and business leaders
              </p>
            </div>

            {/* Stats Section */}
            <div className="mt-16 max-w-3xl mx-auto bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-4 md:p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
                <div className="text-center reveal" style={{ transitionDelay: '0ms' }}>
                  <div className="text-3xl md:text-5xl font-serif font-bold text-[#c8ab3d] mb-2">4M+</div>
                  <div className="text-sm md:text-base text-white/90">Monthly Readers</div>
                </div>
                <div className="text-center border-x border-white/20 reveal" style={{ transitionDelay: '80ms' }}>
                  <div className="text-3xl md:text-5xl font-serif font-bold text-[#c8ab3d] mb-2">100+</div>
                  <div className="text-sm md:text-base text-white/90">Fortune 500 CEOs</div>
                </div>
                <div className="text-center reveal" style={{ transitionDelay: '160ms' }}>
                  <div className="text-3xl md:text-5xl font-serif font-bold text-[#c8ab3d] mb-2">40+</div>
                  <div className="text-sm md:text-base text-white/90">Media Partners</div>
                </div>
                <div className="text-center reveal" style={{ transitionDelay: '240ms' }}>
                  <div className="text-3xl md:text-5xl font-serif font-bold text-[#c8ab3d] mb-2">120+</div>
                  <div className="text-sm md:text-base text-white/90">Countries</div>
                </div>
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
