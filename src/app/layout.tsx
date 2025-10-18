import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "QRFeedback.ai - Instant Customer Feedback via QR Codes",
    template: "%s | QRFeedback.ai"
  },
  description: "Collect instant customer feedback with QR codes. Perfect for restaurants, retail, events. No app required. Start free today!",
  keywords: ["QR code feedback tool", "small business feedback app", "QR feedback form", "customer feedback", "QR code survey", "restaurant feedback", "retail feedback"],
  authors: [{ name: "QRFeedback.ai" }],
  creator: "QRFeedback.ai",
  publisher: "QRFeedback.ai",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://qrfeedback.ai",
    title: "QRFeedback.ai - Instant Customer Feedback via QR Codes",
    description: "Collect instant customer feedback with QR codes. Perfect for restaurants, retail, events. No app required. Start free today!",
    siteName: "QRFeedback.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "QRFeedback.ai - Instant Customer Feedback via QR Codes",
    description: "Collect instant customer feedback with QR codes. Perfect for restaurants, retail, events.",
    creator: "@qrfeedbackai",
  },
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
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
