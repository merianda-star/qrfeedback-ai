import Link from 'next/link'
import { ArrowLeft, QrCode } from 'lucide-react'

export const metadata = {
  title: 'About Us - QRFeedback.ai',
  description: 'Learn about QRFeedback.ai and our mission to revolutionize customer feedback collection.'
}

export default function AboutPage() {
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
          <div className="flex items-center mb-8">
            <QrCode className="w-12 h-12 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">About QRFeedback.ai</h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                QRFeedback.ai is dedicated to making customer feedback collection effortless and instant. 
                We believe that every business, regardless of size, deserves access to powerful feedback 
                tools that help them understand and serve their customers better.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Do</h2>
              <p className="text-gray-700 leading-relaxed">
                We provide a simple yet powerful platform that allows businesses to create custom feedback 
                forms and collect responses through QR codes. No app downloads required for your customers - 
                just scan and respond. It's that simple.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Why QR Codes?</h2>
              <p className="text-gray-700 leading-relaxed">
                QR codes bridge the physical and digital worlds seamlessly. They're universal, requiring 
                no special apps, and can be placed anywhere - on receipts, table tents, product packaging, 
                or service counters. This makes collecting feedback friction-free for both businesses and customers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About Startekk LLC</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                QRFeedback.ai is a product of Startekk LLC, a technology company focused on creating 
                innovative solutions for modern businesses.
              </p>
              <div className="text-gray-600">
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
