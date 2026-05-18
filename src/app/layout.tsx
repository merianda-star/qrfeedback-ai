import type { Metadata, Viewport } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#b05c52',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.qrfeedback.ai'),

  title: {
    default: 'QRFeedback.ai — AI-Powered QR Code Feedback & Review Management',
    template: '%s | QRFeedback.ai',
  },

  description: 'Collect customer feedback via QR code. AI automatically routes 4–5 star reviews to Google, captures complaints privately. Setup in 2 minutes. No app required.',

  keywords: [
    'QR code feedback',
    'customer feedback QR code',
    'Google review management',
    'review routing software',
    'AI feedback analysis',
    'QR code review system',
    'smart review routing',
    'feedback collection software',
    'restaurant feedback QR',
    'negative review management',
  ],

  authors: [{ name: 'Startekk LLC', url: 'https://www.qrfeedback.ai' }],
  creator: 'Startekk LLC',
  publisher: 'Startekk LLC',

  // ── Robots ─────────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ── Open Graph ─────────────────────────────────────────────────────────────
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.qrfeedback.ai',
    siteName: 'QRFeedback.ai',
    title: 'QRFeedback.ai — AI-Powered QR Code Feedback & Review Management',
    description: 'Collect customer feedback via QR code. AI routes happy customers to Google Reviews, captures complaints privately. Setup in 2 minutes. No app required.',
    images: [
      {
        url: '/og-image.png',   // Create a 1200×630 image and put it in /public
        width: 1200,
        height: 630,
        alt: 'QRFeedback.ai — Turn customer feedback into 5-star Google reviews',
        type: 'image/png',
      },
    ],
  },

  // ── Twitter / X ────────────────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    site: '@qrfeedbackai',    // update if you have a Twitter handle
    title: 'QRFeedback.ai — AI-Powered QR Code Feedback',
    description: 'Collect customer feedback via QR code. AI routes happy customers to Google Reviews, captures complaints privately.',
    images: ['/og-image.png'],
  },

  // ── Canonical & alternates ─────────────────────────────────────────────────
  alternates: {
    canonical: 'https://www.qrfeedback.ai',
  },

  // ── Icons ──────────────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: '/favicon.ico',
  },

  manifest: '/site.webmanifest',

  // ── Google Search Console verification ────────────────────────────────────
  // Get this from: search.google.com/search-console → Add property → HTML tag
  verification: {
    google: 'google884baa637810b9bd',
  },

  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <head>
        {/* GA4 — replace G-XXXXXXXXXX with your Measurement ID */}
        {/* Uncomment once you have a GA4 property set up */}
        {/*
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX', { page_path: window.location.pathname });
            `,
          }}
        />
        */}
      </head>
      <body className={dmSans.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}