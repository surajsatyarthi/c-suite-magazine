import Navigation from '@/components/Navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function AdvertisePage() {
  const audienceStats = [
    { label: "Open Rate", value: "42%", icon: "📧" },
    { label: "Monthly Readers", value: "3M+", icon: "👥" },
    { label: "Click-Through Rate", value: "7.5%", icon: "🎯" },
    { label: "Global Reach", value: "45+", subtext: "Countries", icon: "🌍" }
  ]

  const adPackages = [
    {
      name: "Cover Feature",
      price: "$15,000",
      period: "/issue",
      features: [
        "Premium cover placement",
        "Executive portrait feature",
        "Brand equity & recognition",
        "Digital & print exposure",
        "Social media amplification",
        "Magzine Archive placement"
      ]
    },
    {
      name: "CXO in Focus",
      price: "$12,000",
      period: "/feature",
      features: [
        "In-depth executive profile",
        "Thought leadership showcase",
        "Multi-page spread",
        "Homepage feature",
        "Newsletter distribution",
        "Permanent digital Magzine Archive"
      ],
      popular: true
    },
    {
      name: "Full Page Ad",
      price: "$5,000",
      period: "/issue",
      features: [
        "Full magazine page",
        "Premium positioning",
        "High-resolution graphics",
        "Print & digital editions",
        "3M+ impressions",
        "Performance tracking"
      ]
    }
  ]

  const readerTypes = [
    {
      title: "Senior Leadership",
      roles: ["CEO, CFO, CTO", "Presidents & VPs", "Board Directors", "General Managers", "Business Owners"]
    },
    {
      title: "Operations & Strategy",
      roles: ["COO", "Strategy Directors", "Operations Managers", "Supply Chain Leaders", "Program Managers"]
    },
    {
      title: "Innovation & Technology",
      roles: ["CIO, CTO", "Digital Transformation Leads", "Innovation Directors", "IT Managers", "Tech Architects"]
    },
    {
      title: "Sales & Business Development",
      roles: ["Sales Directors", "VP Business Development", "Account Executives", "Growth Managers", "Partnership Directors"]
    },
    {
      title: "Finance & Investment",
      roles: ["CFO", "Finance Directors", "Investment Managers", "Risk Managers", "Controllers"]
    },
    {
      title: "Marketing & Communications",
      roles: ["CMO", "Marketing Directors", "Brand Managers", "Communications Directors", "PR Leaders"]
    }
  ]

  return (
    <>
      <Navigation />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Advertise' }]} />
      
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="dark-section bg-gradient-to-br from-[#082945] via-[#0a3350] to-[#082945] text-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-serif font-black mb-4 text-white heading-premium">
              Advertise in the World's Leading Executive Magazine
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto mb-4">
              Promote Your Brand to 3M+ C-Suite Decision-Makers
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-[#c8ab3d] text-white font-bold rounded-lg hover:bg-[#b39a35] transition-colors"
            >
              Get Started Today
            </Link>
          </div>
        </div>

        {/* Audience Stats */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-serif font-black text-gray-900 text-center mb-12">
              Our Audience
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {audienceStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-5xl mb-4">{stat.icon}</div>
                  <div className="text-4xl font-bold text-[#082945] mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                  {stat.subtext && <div className="text-sm text-gray-500">{stat.subtext}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ad Packages */}
        <div className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-serif font-black text-gray-900 text-center mb-4">
              Advertising Packages
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Flexible options to meet your marketing objectives and budget
            </p>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {adPackages.map((pkg, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                    pkg.popular ? 'ring-4 ring-[#c8ab3d] transform scale-105' : ''
                  }`}
                >
                  {pkg.popular && (
                    <div className="bg-[#c8ab3d] text-white text-center py-2 font-bold text-sm">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                      {pkg.name}
                    </h3>
                    <div className="flex items-end mb-6">
                      <span className="text-5xl font-black text-[#082945]">{pkg.price}</span>
                      <span className="text-gray-600 ml-2 mb-2">{pkg.period}</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-[#c8ab3d] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/contact"
                      className={`block w-full py-3 text-center rounded-lg font-bold transition-colors ${
                        pkg.popular
                          ? 'bg-[#c8ab3d] text-white hover:bg-[#b39a35]'
                          : 'bg-gray-100 text-[#082945] hover:bg-gray-200'
                      }`}
                    >
                      Get Quote
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reader Types */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-serif font-black text-gray-900 text-center mb-4">
              Who Reads C-Suite Magazine?
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              Our audience consists of top-tier decision-makers across industries
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {readerTypes.map((type, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-bold text-[#082945] mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#c8ab3d] rounded-full" />
                    {type.title}
                  </h3>
                  <ul className="space-y-2">
                    {type.roles.map((role, i) => (
                      <li key={i} className="text-sm text-gray-700 pl-4">
                        • {role}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Why Advertise */}
        <div className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-serif font-black text-gray-900 text-center mb-12">
                Why Advertise With Us?
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#c8ab3d] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                      1
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Audience</h3>
                    <p className="text-gray-600">
                      Reach C-level executives with real purchasing power and decision-making authority
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#c8ab3d] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                      2
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Trusted Brand</h3>
                    <p className="text-gray-600">
                      Associate your brand with a respected publication known for quality content
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#c8ab3d] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                      3
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Measurable Results</h3>
                    <p className="text-gray-600">
                      Track impressions, clicks, and conversions with comprehensive analytics
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#c8ab3d] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                      4
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Custom Solutions</h3>
                    <p className="text-gray-600">
                      Tailored advertising strategies to meet your specific business objectives
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="py-16 bg-gradient-to-r from-[#082945] to-[#0a3a5c]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-serif font-black text-white mb-6">
              Ready to Reach Decision Makers?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Download our complete media kit or get in touch to discuss your advertising needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="px-8 py-4 bg-[#c8ab3d] text-white font-bold rounded-lg hover:bg-[#b39a35] transition-colors"
              >
                Contact Sales Team
              </Link>
              <button className="px-8 py-4 bg-white text-[#082945] font-bold rounded-lg hover:bg-gray-100 transition-colors">
                Download Media Kit (PDF)
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
