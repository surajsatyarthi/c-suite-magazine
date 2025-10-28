import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function ContactPage() {
  return (
    <>
      <Navigation />
      
      <main className="bg-white">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-[#082945] via-[#0a3350] to-[#082945] text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-serif font-normal mb-6">Contact Us</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                We'd love to hear from you. Get in touch with our editorial team.
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div>
                  <h2 className="text-3xl font-serif font-normal text-gray-900 mb-6">Send us a message</h2>
                  
                  <form className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#c8ab3d] focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#c8ab3d] focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#c8ab3d] focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#c8ab3d] focus:border-transparent transition-colors"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#082945] text-white px-8 py-4 rounded-md font-semibold hover:bg-[#0a3350] transition-colors"
                    >
                      Send Message
                    </button>
                  </form>
                </div>

                {/* Contact Information */}
                <div>
                  <h2 className="text-3xl font-serif font-normal text-gray-900 mb-6">Get in touch</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-serif font-normal text-gray-900 mb-3">Editorial</h3>
                      <p className="text-gray-700 leading-relaxed">
                        For story pitches, press releases, and editorial inquiries.
                      </p>
                      <p className="text-[#082945] font-medium mt-2">
                        editorial@theceomagazine.com
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-serif font-normal text-gray-900 mb-3">Advertising</h3>
                      <p className="text-gray-700 leading-relaxed">
                        For advertising opportunities and partnerships.
                      </p>
                      <p className="text-[#082945] font-medium mt-2">
                        advertising@theceomagazine.com
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-serif font-normal text-gray-900 mb-3">General</h3>
                      <p className="text-gray-700 leading-relaxed">
                        For general inquiries and feedback.
                      </p>
                      <p className="text-[#082945] font-medium mt-2">
                        info@theceomagazine.com
                      </p>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-8">
                      <h3 className="text-xl font-serif font-normal text-gray-900 mb-3">Follow Us</h3>
                      <div className="flex gap-4">
                        <a href="#" className="text-gray-600 hover:text-[#082945] transition-colors">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </a>
                        <a href="#" className="text-gray-600 hover:text-[#082945] transition-colors">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                          </svg>
                        </a>
                        <a href="#" className="text-gray-600 hover:text-[#082945] transition-colors">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
