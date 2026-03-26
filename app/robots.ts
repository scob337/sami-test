import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/auth/', '/checkout/', '/dashboard/', '/settings/'],
    },
    sitemap: 'https://7types.online/sitemap.xml',
  }
}
