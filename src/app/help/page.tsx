import Link from 'next/link'
import { ArrowLeft, HelpCircle, BookOpen, Video, MessageCircle } from 'lucide-react'

export const metadata = {
  title: 'Help Center - QRFeedback.ai',
  description: 'Get help with QRFeedback.ai - FAQs, guides, and support'
}

export default function HelpPage() {
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 mb-12">Find answers and get support</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">FAQs</h3>
              <p className="text-gray-600 text-sm">Quick answers to common questions</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Guides</h3>
              <p className="text-gray-600 text-sm">Step-by-step tutorials</p>
            </div>

            <Link href="/docs" className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <Video className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
              <p className="text-gray-600 text-sm">Technical documentation</p>
            </Link>

            <Link href="/contact" className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Contact Support</h3>
              <p className="text-gray-600 text-sm">Get personalized help</p>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How do I create my first feedback form?</h3>
                <p className="text-gray-700">
                  After signing up and logging in, click "Create New Form" from your dashboard. 
                  Add your questions, customize the settings, and generate a QR code that you can print or display.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do my customers need to download an app?</h3>
                <p className="text-gray-700">
                  No! Your customers simply scan the QR code with their phone's camera app, and they'll 
                  be taken directly to your feedback form in their web browser. No downloads required.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I customize the feedback forms?</h3>
                <p className="text-gray-700">
                  Yes! You can add custom questions, change the layout, add your branding (on Pro and Business plans), 
                  and customize the thank you message.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How do I view the feedback I receive?</h3>
                <p className="text-gray-700">
                  All feedback appears in your dashboard in real-time. You can view responses, export data, 
                  and analyze trends through our analytics tools.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What's included in the Free plan?</h3>
                <p className="text-gray-700">
                  The Free plan includes 2 feedback forms and up to 50 responses per month. Perfect for 
                  small businesses or testing the platform.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I upgrade or downgrade my plan?</h3>
                <p className="text-gray-700">
                  Yes! You can change your plan at any time from your account settings. Upgrades take effect 
                  immediately, and downgrades apply at the end of your current billing cycle.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is my data secure?</h3>
                <p className="text-gray-700">
                  Absolutely. All data is encrypted in transit and at rest. We follow industry best practices 
                  for security and never share your data with third parties.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How do I print my QR codes?</h3>
                <p className="text-gray-700">
                  Download the QR code from your dashboard as a high-resolution PNG or SVG file. 
                  You can then print it on business cards, table tents, posters, or anywhere else you need it.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
            <p className="text-gray-700 mb-4">Still need help?</p>
            <Link 
              href="/contact"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
