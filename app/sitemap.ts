import type { MetadataRoute } from 'next'
import { COMPANIES } from '@/lib/companies'

const BASE = 'https://skill.supply'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return [
    { url: BASE, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/apply`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/companies`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    ...COMPANIES.map((company) => ({
      url: `${BASE}/companies/${company.slug}`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
  ]
}
