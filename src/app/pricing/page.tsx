import type { Metadata } from "next";
import PricingContent from './PricingContent'

export const metadata: Metadata = {
  title: "Pricing Plans - QR Code Feedback Tool",
  description: "Compare plans for QRFeedback.ai. Start free with 3 forms & 50 responses. Upgrade to Pro for unlimited forms. No credit card required.",
  keywords: ["QR feedback pricing", "feedback tool pricing", "QR code app cost", "business feedback plans"],
  openGraph: {
    title: "Pricing Plans - QRFeedback.ai",
    description: "Compare plans for QRFeedback.ai. Start free with 3 forms & 50 responses.",
  },
};

export default function PricingPage() {
  return <PricingContent />
}
