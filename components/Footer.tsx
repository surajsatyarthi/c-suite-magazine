import Link from 'next/link'
import pkg from '@/package.json'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="dark-section bg-[#082945] text-white mt-20 border-t-[3px] border-[#0a3350] relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Brand Column: force to rightmost column on lg, right column on md */}
          <div className="lg:col-span-1 lg:col-start-3 md:col-start-2 flex flex-col items-end">
            <div className="site-logo site-logo--footer text-white mb-4">
              <div className="site-logo-inner">
                <div className="site-logo-title">C<span className="site-logo-dash">-</span>SUITE</div>
                <div className="site-logo-subtitle metallic-sheen metallic-sheen-strong">MAGAZINE</div>
              </div>
            </div>
            <p className="text-white mb-6 text-[0.79rem] leading-relaxed max-w-md text-right">
              YOUR LEGACY GOES GLOBAL
            </p>
          </div>

          {/* Content and Popular columns removed per request */}

          {/* Footer Links (full-width single line on desktop) */}
          <div className="lg:col-span-3 lg:col-start-1 md:col-span-2 md:col-start-1 w-full">
            <nav aria-label="Footer links">
              <ul className="flex items-center justify-center gap-x-5 text-sm flex-wrap md:flex-nowrap lg:flex-nowrap">
                <li><Link href="/about" prefetch className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]">About Us</Link></li>
                <li><Link href="/contact" prefetch className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]">Contact Us</Link></li>
                <li><Link href="/archive" prefetch className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]">Magazine Archive</Link></li>
                <li><Link href="/privacy" prefetch className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-300 hover:text-[#c8ab3d] transition-colors premium-underline">Terms & Conditions</Link></li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-[#0a3350] mt-12 pt-8">
          <div className="text-center">
            {/* Increase specificity and adjust size + line-height by ~30% */}
            <p className="!text-[0.65rem] !leading-[0.8125rem] !text-gray-400">© {currentYear} C-Suite Magazine. All Rights Reserved.</p>
            <p className="!text-[0.65rem] !leading-[0.8125rem] !text-gray-500 mt-2">Invictus International Consulting Services</p>
            <p className="!text-[0.65rem] !leading-[0.8125rem] !text-gray-400 mt-1">v{pkg.version}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
