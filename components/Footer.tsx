import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="dark-section bg-[#082945] text-white mt-20 border-t-[3px] border-[#c8ab3d] relative overflow-hidden">
      {/* Animated Glow Effect */}
      <div 
        className="absolute top-0 left-[-100%] w-full h-full pointer-events-none z-[1] animate-footer-glow"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(200, 171, 61, 0.15), transparent)'
        }}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <h3 className="text-3xl font-serif font-normal text-white mb-4">
              C-Suite Magazine
            </h3>
            <p className="text-white mb-6 text-sm leading-relaxed max-w-md">
              Your legacy goes global.
            </p>
          </div>

          {/* Content Column */}
          <div>
            <h4 className="text-white font-serif font-bold text-lg uppercase tracking-wider mb-6">Content</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" prefetch className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]">Home</Link></li>
              <li><Link href="/articles" prefetch className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]">Articles</Link></li>
              <li><Link href="/category/leadership" prefetch className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]">Leadership</Link></li>
              <li><Link href="/category/business" prefetch className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]">Business</Link></li>
              <li><Link href="/category/innovation" prefetch className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]">Innovation</Link></li>
            </ul>
          </div>

          {/* Categories Column */}
          <div>
            <h4 className="text-white font-serif font-bold text-lg uppercase tracking-wider mb-6">Popular</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/category/ceo-woman" prefetch className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]">CEO Woman</Link></li>
              <li><Link href="/category/entrepreneurs" prefetch className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]">Entrepreneurs</Link></li>
              <li><Link href="/category/technology" prefetch className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]">Technology</Link></li>
              <li><Link href="/category/sustainability" prefetch className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]">Sustainability</Link></li>
              <li><Link href="/category/startups" prefetch className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]">Startups</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-white font-serif font-bold text-lg uppercase tracking-wider mb-6">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" prefetch className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]">About Us</Link></li>
              <li><Link href="/contact" prefetch className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]">Contact</Link></li>
              <li><Link href="/contact" prefetch className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]">Get in Touch</Link></li>
              <li><Link href="/archive" prefetch className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]">Magazine Archive</Link></li>
              <li><Link href="/advertise" prefetch className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]">Advertise</Link></li>
              <li><Link href="/privacy" prefetch className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-[#0a3350] mt-12 pt-8">
          <div className="text-center">
            {/* Increase specificity and adjust size + line-height by ~30% */}
            <p className="!text-[0.65rem] !leading-[0.8125rem] !text-gray-400">© {currentYear} C-Suite Magazine. All Rights Reserved.</p>
            <p className="!text-[0.65rem] !leading-[0.8125rem] !text-gray-500 mt-2">Invictus International Consulting Services</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
