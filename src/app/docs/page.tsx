import Link from 'next/link'
import { ArrowLeft, Code, Database, Zap, Shield } from 'lucide-react'

export const metadata = {
  title: 'Documentation - QRFeedback.ai',
  description: 'Technical documentation for QRFeedback.ai'
}

export default function DocsPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
          <p className="text-xl text-gray-600 mb-12">Technical guides and API documentation</p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <Code className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Getting Started</h3>
              <p className="text-gray-700 mb-4">
                Learn how to set up your account and create your first feedback form in minutes.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• Account setup</li>
                <li>• Creating forms</li>
                <li>• QR code generation</li>
                <li>• Collecting responses</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <Database className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Form Configuration</h3>
              <p className="text-gray-700 mb-4">
                Customize your feedback forms with various question types and settings.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• Question types</li>
                <li>• Rating scales</li>
                <li>• Multiple choice</li>
                <li>• Open-ended responses</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <Zap className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">API Integration</h3>
              <p className="text-gray-700 mb-4">
                Integrate QRFeedback.ai with your existing systems using our REST API.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• Authentication</li>
                <li>• Form management</li>
                <li>• Response retrieval</li>
                <li>• Webhooks</li>
              </ul>
              <p className="text-sm text-gray-500 mt-4">Available on Business plan</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <Shield className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Security & Privacy</h3>
              <p className="text-gray-700 mb-4">
                Learn about our security practices and compliance standards.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• Data encryption</li>
                <li>• GDPR compliance</li>
                <li>• Access controls</li>
                <li>• Data retention</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Start Guide</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</span>
                  Sign Up for an Account
                </h3>
                <p className="text-gray-700 ml-9">
                  Create your free account at QRFeedback.ai. No credit card required to start.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
                  Create Your First Form
                </h3>
                <p className="text-gray-700 ml-9">
                  Click "Create New Form" from your dashboard. Add your questions, customize the design, and save.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</span>
                  Generate Your QR Code
                </h3>
                <p className="text-gray-700 ml-9">
                  Download your unique QR code and place it where your customers can scan it.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">4</span>
                  Start Collecting Feedback
                </h3>
                <p className="text-gray-700 ml-9">
                  Watch responses come in real-time through your dashboard. Export data or view analytics anytime.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Need More Help?</h3>
            <p className="text-gray-700 mb-4">
              Our support team is here to help you get the most out of QRFeedback.ai.
            </p>
            <div className="flex gap-4">
              <Link 
                href="/help"
                className="inline-block bg-white border border-blue-600 text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Visit Help Center
              </Link>
              <Link 
                href="/contact"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
