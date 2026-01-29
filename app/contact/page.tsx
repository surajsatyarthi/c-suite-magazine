'use client'

import Navigation from '@/components/Navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import Footer from '@/components/Footer'
import { useActionState, useEffect } from 'react'
import { submitContactForm } from '@/app/actions/contact'

const initialState = {
  success: false,
  message: '',
}

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState)

  return (
    <>
      <Navigation />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Contact Us' }]} />
      
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="dark-section bg-gradient-to-br from-[#082945] via-[#0a3350] to-[#082945] text-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-serif font-black mb-4 text-white heading-premium">
              Contact Us
            </h1>
            <p className="text-xl text-white max-w-2xl mx-auto mb-8">
              Reach out to the C-Suite Magazine team.
            </p>
            <div className="flex justify-center">
                <a href="/plans" className="inline-flex items-center gap-2 px-8 py-4 bg-[#c8ab3d] text-[#082945] font-bold rounded-lg hover:bg-[#d6b745] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    <span>Check Plan Details</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </a>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <svg className="w-6 h-6 text-[#c8ab3d] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-600">contact@csuitemagazine.global</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <svg className="w-6 h-6 text-[#c8ab3d] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-900">Offices</h3>
                      <div className="text-gray-600">
                        <h4 className="text-lg font-serif font-bold text-gray-900">United States</h4>
                        <p className="font-medium text-gray-800">Global Head Office</p>
                        <p>930, N 96th Street,</p>
                        <p>Seattle, WA, 98103, USA</p>
                        <div className="h-px bg-gray-200 my-3" />
                        <h4 className="text-lg font-serif font-bold text-gray-900">Singapore</h4>
                        <p className="font-medium text-gray-800">Singapore Office</p>
                        <p className="font-medium text-gray-800">Capital Square</p>
                        <p>C-101, Level 7, Capital Square,</p>
                        <p>23 Church Street,</p>
                        <p>049481, Singapore</p>
                        <div className="h-px bg-gray-200 my-3" />
                        <h4 className="text-lg font-serif font-bold text-gray-900">United Arab Emirates</h4>
                        <p className="font-medium text-gray-800">Dubai Office</p>
                        <p>C-1211, Zaa'beel Second</p>
                        <p>Za'abeel 2</p>
                        <p>Dubai, United Arab Emirates</p>
                        <div className="h-px bg-gray-200 my-3" />
                        <h4 className="text-lg font-serif font-bold text-gray-900">India</h4>
                        <p className="font-medium text-gray-800">Gurugram Office</p>
                        <p>C 1620, 4th Floor, Peach Tree Road,</p>
                        <p>Sushant Lok Phase 1,</p>
                        <p>Gurugram, Haryana - 122002</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">

                  <h3 className="font-semibold text-gray-900 mb-4">Response Time</h3>
                  <p className="text-gray-600 text-sm">We typically respond within 24-48 business hours.</p>
                </div>
              </div>
            </div>

            {/* PR Submission Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">Get in Touch</h2>
                
                {state.success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg" role="status" aria-live="polite">
                    <p className="text-green-800 font-medium">✓ {state.message}</p>
                  </div>
                )}
                 {!state.success && state.message && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
                    <p className="text-red-800 font-medium">{state.message}</p>
                  </div>
                )}

                <form action={formAction} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input type="text" id="name" name="name" required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8ab3d]" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                      <input type="email" id="email" name="email" required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8ab3d]" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">Company *</label>
                      <input type="text" id="company" name="company" required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8ab3d]" />
                    </div>
                    <div>
                      <label htmlFor="position" className="block text-sm font-semibold text-gray-700 mb-2">Position *</label>
                      <input type="text" id="position" name="position" required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8ab3d]" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input type="tel" id="phone" name="phone"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8ab3d]" />
                    </div>
                    <div>
                      <label htmlFor="submissionType" className="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
                      <select id="submissionType" name="submissionType" required defaultValue="press-release"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8ab3d]">
                        <option value="press-release">Press Release</option>
                        <option value="feature-request">Feature Request</option>
                        <option value="partnership">Partnership</option>
                        <option value="general">General Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                    <input type="text" id="subject" name="subject" required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8ab3d]" />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                    <textarea id="message" name="message" required rows={8}
                      placeholder="Provide details about your press release or inquiry..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] resize-none" />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600"><strong>Guidelines:</strong> Ensure content is newsworthy and relevant to C-level executives.</p>
                  </div>

                  <button type="submit" disabled={isPending} className="w-full py-4 bg-[#082945] text-white font-bold text-lg rounded-lg hover:bg-[#0a3a5c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isPending ? 'Sending...' : 'Submit for Review'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
