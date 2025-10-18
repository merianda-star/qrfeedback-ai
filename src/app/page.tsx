import { PRICING_PLANS } from '@/lib/pricing'
import Link from 'next/link'
import { ArrowRight, QrCode, Smartphone, BarChart3, Check } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-blue-800">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <QrCode className="w-8 h-8 text-white mr-2" />
            <span className="text-2xl font-bold text-white">QRfeedback.ai</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/#features" 
              className="text-white hover:text-blue-200 transition-colors"
            >
              Features
            </Link>
            <Link 
              href="/pricing" 
              className="text-white hover:text-blue-200 transition-colors"
            >
              Pricing
            </Link>
            <Link 
              href="/#how-it-works" 
              className="text-white hover:text-blue-200 transition-colors"
            >
              How It Works
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/auth/login" 
              className="text-white hover:text-blue-200 transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/auth/register" 
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Instant Feedback via
            <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
              {" "}QR Codes
            </span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Create feedback forms, generate QR codes, and collect responses instantly. 
            Perfect for restaurants, retail, events, and service businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              Start Free - No Credit Card Required
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/pricing"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              View Pricing
            </Link>
          </div>
          <p className="text-blue-200 text-sm mt-4">
            Free plan available • No credit card required • Cancel anytime
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Perfect for Every Business
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Whether you run a restaurant, retail store, event, or service business - get instant customer feedback
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🍽️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Restaurants</h3>
              <p className="text-gray-600">
                Place QR codes on tables for instant customer feedback. Improve service quality and boost reviews.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛍️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Retail</h3>
              <p className="text-gray-600">
                Get shopping experience feedback at checkout. Understand customer satisfaction in real-time.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎪</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Events</h3>
              <p className="text-gray-600">
                Collect attendee feedback instantly. Improve future events with actionable insights.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💼</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Services</h3>
              <p className="text-gray-600">
                Get feedback after appointments, consultations, or service delivery. Build better relationships.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            How It Works
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Get started in minutes and start collecting feedback immediately
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Create & Generate</h3>
              <p className="text-gray-600">
                Build your feedback form with custom questions and instantly generate a QR code
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Scan & Respond</h3>
              <p className="text-gray-600">
                Customers scan with their phone and provide feedback instantly - no app download needed
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Analyze & Improve</h3>
              <p className="text-gray-600">
                View real-time analytics dashboard and improve your business based on insights
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Preview Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Start free and upgrade as you grow. No hidden fees or long-term contracts.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`border rounded-lg p-8 hover:shadow-lg transition-shadow ${
                  plan.popular ? 'border-2 border-blue-600 relative bg-blue-50' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-6">
                  {plan.price}
                  <span className="text-lg text-gray-600 font-normal">/month</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.slice(0, 5).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  href={plan.priceId ? "/pricing" : "/auth/register"}
                  className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : plan.priceId
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {plan.priceMonthly === 0 ? 'Get Started Free' : 'Start Free Trial'}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/pricing"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-lg"
            >
              View Full Pricing Details
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Collecting Feedback?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of businesses using QRfeedback.ai to improve customer satisfaction
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/pricing"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center mb-4">
                <QrCode className="w-6 h-6 text-white mr-2" />
                <span className="text-xl font-bold">QRfeedback.ai</span>
              </div>
              <p className="text-gray-400">
                Instant feedback collection for modern businesses
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            © 2025 QRfeedback.ai. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
