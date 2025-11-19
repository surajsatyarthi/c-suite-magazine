import Navigation from '@/components/Navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <>
      <Navigation />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />
      
      <main className="bg-white">
        <div className="dark-section bg-gradient-to-br from-[#082945] via-[#0a3350] to-[#082945] text-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-serif font-black mb-4 text-white">Privacy Policy</h1>
            <p className="text-xl text-white max-w-2xl mx-auto">Effective date: Jan 1 2025</p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                This Privacy Policy explains how C‑Suite Magazine collects, uses, shares, and protects your personal information. By using our services, you agree to the terms outlined in this policy.
              </p>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Information We Collect</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li><span className="font-medium">Personal Information:</span> Your name, email, phone number, job title, and company details provided when you interact with us.</li>
                <li><span className="font-medium">Usage Information:</span> Data such as your IP address, browser type, device, and how you use our website.</li>
                <li><span className="font-medium">Payment Information:</span> Details needed to process payments, handled securely by trusted third‑party providers.</li>
                <li><span className="font-medium">Communication Records:</span> Emails or messages you send us.</li>
              </ul>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li>Providing and improving our services and user experience.</li>
                <li>Sending newsletters, updates, or promotional content (you can opt out anytime).</li>
                <li>Managing event registrations, transactions, and customer support.</li>
                <li>Analyzing website traffic and user behavior.</li>
                <li>Complying with legal and regulatory obligations.</li>
              </ul>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Sharing Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li><span className="font-medium">Service Providers:</span> For payment processing, analytics, communications, and marketing support.</li>
                <li><span className="font-medium">Legal Authorities:</span> If required by law or to protect our rights, users, or partners.</li>
                <li><span className="font-medium">Business Partners:</span> In the event of a merger, acquisition, or sale of our business.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-6">We do not sell your personal information.</p>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed mb-6">We use cookies and similar technologies to improve your experience, measure performance, and personalize content. You can manage or disable cookies through your browser settings.</p>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-6">We take reasonable administrative, technical, and physical measures to protect your data. However, no method of transmission or storage is completely secure.</p>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Your Rights</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li>Access and update your personal information.</li>
                <li>Request deletion of your data.</li>
                <li>Opt‑out of marketing communications.</li>
              </ul>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Data Retention</h2>
              <p className="text-gray-700 leading-relaxed mb-6">We retain information only as long as necessary for the purposes described in this policy or as required by law.</p>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">International Transfers</h2>
              <p className="text-gray-700 leading-relaxed mb-6">Your data may be processed in countries outside your own. We ensure such transfers comply with applicable laws and safeguards.</p>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Third‑Party Links</h2>
              <p className="text-gray-700 leading-relaxed mb-6">Our website may link to other sites. We are not responsible for their privacy practices. Please review their policies.</p>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-6">We may update this policy from time to time. Changes will be posted with the new effective date.</p>

              <h2 className="text-2xl font-serif font-normal text-gray-900 mt-12 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-2">If you have questions or concerns, contact us at:</p>
              <p className="text-[#082945] font-medium">contact@csuitemagazine.global</p>
              <p className="text-gray-700 leading-relaxed mt-4">We are committed to protecting your privacy and maintaining your trust in our services.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
