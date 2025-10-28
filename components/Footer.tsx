import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#082945] text-white mt-20 border-t-[3px] border-[#c8ab3d] relative overflow-hidden">
      {/* Animated Glow Effect */}
      <div 
        className="absolute top-0 left-[-100%] w-full h-full pointer-events-none z-[1] animate-footer-glow"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(200, 171, 61, 0.15), transparent)'
        }}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <h3 className="text-3xl font-serif font-normal text-white mb-4">
              C-Suite Magazine
            </h3>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed max-w-md">
              The world's premier source of information, inspiration and motivation for successful leaders, executives, investors and entrepreneurs.
            </p>
          </div>

          {/* Content Column */}
          <div>
            <h4 className="text-white font-serif font-bold text-lg uppercase tracking-wider mb-6">Content</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="text-gray-300 hover:text-[#c8ab3d] transition-colors">Home</Link></li>
              <li><Link href="/articles" className="text-gray-300 hover:text-[#c8ab3d] transition-colors">Articles</Link></li>
              <li><Link href="/category/leadership" className="text-gray-300 hover:text-[#c8ab3d] transition-colors">Leadership</Link></li>
              <li><Link href="/category/business" className="text-gray-300 hover:text-[#c8ab3d] transition-colors">Business</Link></li>
              <li><Link href="/category/innovation" className="text-gray-300 hover:text-[#c8ab3d] transition-colors">Innovation</Link></li>
            </ul>
          </div>

          {/* Categories Column */}
          <div>
            <h4 className="text-white font-serif font-bold text-lg uppercase tracking-wider mb-6">Popular</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/category/ceo-woman" className="text-gray-300 hover:text-[#c8ab3d] transition-colors">CEO Woman</Link></li>
              <li><Link href="/category/entrepreneurs" className="text-gray-300 hover:text-[#c8ab3d] transition-colors">Entrepreneurs</Link></li>
              <li><Link href="/category/lifestyle" className="text-gray-300 hover:text-[#c8ab3d] transition-colors">Lifestyle</Link></li>
              <li><Link href="/category/technology" className="text-gray-300 hover:text-[#c8ab3d] transition-colors">Technology</Link></li>
              <li><Link href="/category/sustainability" className="text-gray-300 hover:text-[#c8ab3d] transition-colors">Sustainability</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-white font-serif font-bold text-lg uppercase tracking-wider mb-6">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="text-gray-300 hover:text-[#c8ab3d] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-[#c8ab3d] transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="text-gray-300 hover:text-[#c8ab3d] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-300 hover:text-[#c8ab3d] transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-[#0a3350] mt-12 pt-8">
          <div className="text-center">
            <p className="text-sm text-gray-400">© {currentYear} C-Suite Magazine. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
