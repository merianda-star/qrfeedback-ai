import Link from 'next/link'
import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react'

export const metadata = {
  title: 'Contact Us - QRFeedback.ai',
  description: 'Get in touch with the QRFeedback.ai team'
}

export default function ContactPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <Mail className="w-6 h-6 text-blue-600 mr-4 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a href="mailto:info@qrfeedback.ai" className="text-blue-600 hover:underline">
                      info@qrfeedback.ai
                    </a>
                    <p className="text-gray-600 text-sm mt-1">We typically respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-6 h-6 text-blue-600 mr-4 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                    <p className="text-gray-700">
                      Startekk LLC<br />
                      5465 Legacy Drive, Suite 650<br />
                      Plano, TX 75024<br />
                      United States
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Support</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">For Technical Support</h3>
                  <p className="text-gray-700 mb-2">
                    Visit our <Link href="/help" className="text-blue-600 hover:underline">Help Center</Link> for 
                    FAQs and troubleshooting guides.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">For Sales Inquiries</h3>
                  <p className="text-gray-700 mb-2">
                    Interested in Enterprise plans? Email us at{' '}
                    <a href="mailto:info@qrfeedback.ai" className="text-blue-600 hover:underline">
                      info@qrfeedback.ai
                    </a>
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Business Hours</h3>
                  <p className="text-gray-700">
                    Monday - Friday: 9:00 AM - 6:00 PM CST<br />
                    Saturday - Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
