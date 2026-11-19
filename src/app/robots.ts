import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dassahs-prism.vercel.app';
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/canvas', '/engine', '/privacy', '/terms'],
      disallow: ['/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
