import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <>
      <Navigation />
      
      <main className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif font-normal text-gray-900 mb-4">Terms & Conditions</h1>
            <p className="text-gray-500 mb-12">Last updated: October 28, 2025</p>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Please read these Terms and Conditions ("Terms") carefully before using C-Suite Magazine website. Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
              </p>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Use License</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Permission is granted to temporarily download one copy of the materials (information or software) on C-Suite Magazine's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or public display</li>
                <li>Attempt to decompile or reverse engineer any software</li>
                <li>Remove any copyright or proprietary notations from the materials</li>
              </ul>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                The materials on C-Suite Magazine's website are provided on an 'as is' basis. C-Suite Magazine makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Limitations</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                In no event shall C-Suite Magazine or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on C-Suite Magazine's website.
              </p>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Accuracy of Materials</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                The materials appearing on C-Suite Magazine's website could include technical, typographical, or photographic errors. C-Suite Magazine does not warrant that any of the materials on its website are accurate, complete, or current.
              </p>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Links</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                C-Suite Magazine has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by C-Suite Magazine of the site. Use of any such linked website is at the user's own risk.
              </p>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Modifications</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                C-Suite Magazine may revise these Terms of Service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these Terms of Service.
              </p>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Governing Law</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                These terms and conditions are governed by and construed in accordance with applicable laws, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="text-[#082945] font-medium">
                legal@theceomagazine.com
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
