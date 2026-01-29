import Link from 'next/link'
import { getCategoryUrl } from '@/lib/urls'

export default function Footer() {
  const currentYear = 2026

  return (
    <footer className="dark-section bg-[#082945] text-white mt-20 border-t-[3px] border-[#0a3350] relative overflow-hidden">
      {/* Strategic Partner Bar - Top of Footer */}
      <div className="bg-[#c8ab3d] text-[#082945] py-3 text-center text-xs sm:text-sm font-bold tracking-wide uppercase px-4 cursor-pointer hover:bg-[#d6b745] transition-colors relative z-20">
        <a
          href="https://www.csuitebrand.agency"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full focus:outline-none focus:ring-2 focus:ring-[#082945] focus:ring-offset-2 focus:ring-offset-[#c8ab3d]"
        >
          Elevate Your Executive Presence: Professional LinkedIn Management by C-Suite Brand Agency &rarr;
        </a>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Featured Insights (Revenue/Bread-Winner) */}
          <div className="flex flex-col">
            <h3 className="text-[#c8ab3d] font-bold uppercase text-[1rem] tracking-widest mb-6">Insights</h3>
            <ul className="space-y-4 text-[0.8125rem] text-gray-300">
              <li>
                <Link href={getCategoryUrl('cxo-interview')} className="hover:text-[#f4d875] transition-colors font-semibold">
                  CXO Interviews
                </Link>
              </li>
              <li>
                <Link href="/executive-salaries" className="hover:text-[#f4d875] transition-colors">
                  Executive Salaries
                </Link>
              </li>
              <li>
                <Link href="/archive" className="hover:text-[#f4d875] transition-colors">
                  Magazine Archive
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#f4d875] transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Business Topics (SEO/Context) */}
          <div className="flex flex-col">
            <h3 className="text-[#c8ab3d] font-bold uppercase text-[1rem] tracking-widest mb-6">Topics</h3>
            <ul className="space-y-4 text-[0.8125rem] text-gray-300">
              <li>
                <Link href={getCategoryUrl('leadership')} className="hover:text-[#f4d875] transition-colors">
                  Leadership
                </Link>
              </li>
              <li>
                <Link href={getCategoryUrl('money-and-finance')} className="hover:text-[#f4d875] transition-colors">
                  Money & Finance
                </Link>
              </li>
              <li>
                <Link href={getCategoryUrl('science-technology')} className="hover:text-[#f4d875] transition-colors">
                  Science & Technology
                </Link>
              </li>
              <li>
                <Link href="/tag" className="hover:text-[#f4d875] transition-colors">
                  All Industry Tags
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal Links */}
          <div className="flex flex-col">
            <h3 className="text-[#c8ab3d] font-bold uppercase text-[1rem] tracking-widest mb-6">Legal</h3>
            <div className="flex flex-col gap-3 text-[0.8125rem] text-gray-300">
              <Link href="/plans" className="hover:text-[#f4d875] transition-colors">Plan Details</Link>
              <Link href="/contact" className="hover:text-[#f4d875] transition-colors">Contact Editorial</Link>
              <Link href="/privacy" className="hover:text-[#f4d875] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-[#f4d875] transition-colors">Terms & Conditions</Link>
            </div>
          </div>

          {/* Column 4: Brand & Logo (rightmost) */}
          <div className="flex flex-col items-end">
            <div className="site-logo site-logo--footer text-white mb-4">
              <div className="site-logo-inner">
                <div className="site-logo-title">C<span className="site-logo-dash">-</span>SUITE</div>
                <div className="site-logo-subtitle metallic-sheen metallic-sheen-strong">MAGAZINE</div>
              </div>
            </div>
            <p className="text-white mb-6 text-[0.79rem] leading-relaxed max-w-xs text-right">
              YOUR LEGACY GOES GLOBAL
            </p>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-[#0a3350] mt-12 pt-8">
          <div className="text-center">
            <p className="!text-[0.65rem] !leading-[0.8125rem] !text-gray-400">INVICTUS INTERNATIONAL CONSULTING SERVICES 2026 © ™</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
