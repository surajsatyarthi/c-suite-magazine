import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <>
      <Navigation />
      
      <main className="bg-white">
        {/* Hero Section */}
        <section className="dark-section py-20 bg-gradient-to-br from-[#082945] via-[#0a3350] to-[#082945] text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-white">About C-Suite Magazine</h1>
              <p className="text-xl leading-relaxed font-semibold text-white shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                A premium source of information, inspiration and motivation for the world's most successful leaders, executives, investors and entrepreneurs.
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  C-Suite Magazine is more than a business blog; it's a source of information, inspiration and motivation for the world's most successful leaders, executives, investors and entrepreneurs.
                </p>
                
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Our content creates conversations, our voice is the one that matters. We bring you exclusive interviews, leadership insights, and business strategies from global executives who are shaping the future of business.
                </p>

                <h2 className="text-3xl font-serif font-normal text-gray-900 mt-12 mb-6">Our Mission</h2>
                
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  To provide unparalleled insights into the minds of the world's most influential business leaders, helping aspiring executives and entrepreneurs navigate their path to success with confidence and clarity.
                </p>

                <h2 className="text-3xl font-serif font-normal text-gray-900 mt-12 mb-6">What We Cover</h2>
                
                <div className="grid md:grid-cols-2 gap-8 my-8">
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-xl font-serif font-normal text-gray-900 mb-3">Leadership</h3>
                    <p className="text-gray-700">Insights from global CEOs and executives on what it takes to lead in today's dynamic business landscape.</p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-xl font-serif font-normal text-gray-900 mb-3">Innovation</h3>
                    <p className="text-gray-700">Stories of transformation, disruption, and the technologies shaping the future of business.</p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-xl font-serif font-normal text-gray-900 mb-3">Sustainability</h3>
                    <p className="text-gray-700">How leading executives balance environmental responsibility with business growth and profitability.</p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-xl font-serif font-normal text-gray-900 mb-3">Strategy</h3>
                    <p className="text-gray-700">Actionable business strategies and insights to help you make informed decisions.</p>
                  </div>
                </div>

                <h2 className="text-3xl font-serif font-normal text-gray-900 mt-12 mb-6">Get in Touch</h2>
                
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  We welcome feedback, story ideas, and partnership opportunities. 
                  <Link href="/contact" className="text-[#082945] hover:text-[#0a3350] font-medium ml-1">
                    Contact us
                  </Link> to start a conversation.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
