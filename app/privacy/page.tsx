import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <>
      <Navigation />
      
      <main className="bg-white">
        <div className="dark-section bg-gradient-to-br from-[#082945] via-[#0a3350] to-[#082945] text-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-serif font-black mb-4 text-white">
              Privacy Policy
            </h1>
            <p className="text-xl text-white max-w-2xl mx-auto">
              Last updated: October 28, 2025
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                C-Suite Magazine ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
              </p>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                We may collect information about you in a variety of ways. The information we may collect on the Site includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li>Personal Data: Name, email address, and contact information you provide</li>
                <li>Usage Data: Information about how you use our website</li>
                <li>Cookies and Tracking Technologies: We may use cookies and similar technologies to track activity</li>
              </ul>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Use of Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                We may use information collected about you to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li>Deliver and improve our content and services</li>
                <li>Send you newsletters and marketing communications (with your consent)</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Analyze usage patterns to enhance user experience</li>
              </ul>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Disclosure of Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                We may share information we have collected about you in certain situations:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li>By Law or to Protect Rights</li>
                <li>Third-Party Service Providers</li>
                <li>Business Transfers</li>
              </ul>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Security of Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
              </p>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Your Privacy Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li>The right to access your personal data</li>
                <li>The right to correct inaccurate data</li>
                <li>The right to request deletion of your data</li>
                <li>The right to opt-out of marketing communications</li>
              </ul>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                If you have questions or comments about this Privacy Policy, please contact us at:
              </p>
              <p className="text-[#082945] font-medium">
                privacy@theceomagazine.com
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
