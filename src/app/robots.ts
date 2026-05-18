import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/qrf-admin/',
          '/auth/reset-password',
          '/feedback/',   // individual feedback forms — no indexing needed
        ],
      },
    ],
    sitemap: 'https://www.qrfeedback.ai/sitemap.xml',
    host: 'https://www.qrfeedback.ai',
  }
}