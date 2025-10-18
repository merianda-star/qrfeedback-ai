import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service - QRFeedback.ai',
  description: 'Terms of Service for QRFeedback.ai'
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </header>

      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
            <p className="text-gray-600 text-sm">Last Updated: October 18, 2025</p>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using QRFeedback.ai, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed">
                QRFeedback.ai provides a platform for creating and managing customer feedback forms 
                accessible via QR codes. The service includes form creation, QR code generation, 
                response collection, and analytics tools.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To use certain features of the service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Maintain the security of your password</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to use the service to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful or malicious content</li>
                <li>Spam or harass other users</li>
                <li>Attempt to gain unauthorized access to our systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Subscription and Payments</h2>
              <p className="text-gray-700 leading-relaxed">
                Paid subscriptions are billed in advance on a monthly basis. All fees are non-refundable 
                except as required by law. We reserve the right to change our pricing with 30 days notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                The service and its original content, features, and functionality are owned by Startekk LLC 
                and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                QRFeedback.ai shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages resulting from your use or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice, for any violation 
                of these Terms. You may cancel your account at any time through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                Questions about the Terms of Service should be sent to:
              </p>
              <div className="mt-4 text-gray-700">
                <p>Startekk LLC</p>
                <p>5465 Legacy Drive, Suite 650</p>
                <p>Plano, TX 75024</p>
                <p className="mt-2">Email: <a href="mailto:info@qrfeedback.ai" className="text-blue-600 hover:underline">info@qrfeedback.ai</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
