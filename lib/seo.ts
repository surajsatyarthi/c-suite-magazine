import { Metadata } from 'next'

export interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
  noIndex?: boolean
}

const defaultSEO = {
  title: 'C-Suite Magazine - Leadership, Innovation & Executive Insights',
  description: 'A premium magazine for global CXOs featuring exclusive interviews, leadership insights, and business strategies from top executives worldwide.',
  keywords: ['CEO', 'CXO', 'leadership', 'business strategy', 'executive insights', 'innovation', 'management', 'corporate leadership'],
  image: 'https://csuitemagazine.global/og-image.jpg',
  url: 'https://csuitemagazine.global',
  siteName: 'C-Suite Magazine',
  twitterHandle: '@csuitemagazine'
}

export function generateMetadata(seo: SEOProps = {}): Metadata {
  const {
    title = defaultSEO.title,
    description = defaultSEO.description,
    keywords = defaultSEO.keywords,
    image = defaultSEO.image,
    url = defaultSEO.url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    section,
    tags,
    noIndex = false
  } = seo

  const fullTitle = title === defaultSEO.title ? title : `${title} | C-Suite Magazine`

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : [{ name: 'C-Suite Magazine Editorial Team' }],
    creator: 'C-Suite Magazine',
    publisher: 'Invictus International Consulting Services',
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: defaultSEO.siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
      locale: 'en_US',
      type: type as any,
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : undefined,
        section,
        tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      creator: defaultSEO.twitterHandle,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
    other: {
      'article:publisher': 'https://www.facebook.com/csuitemagazine',
      'article:author': author || 'C-Suite Magazine Editorial Team',
    }
  }
}

export function generateStructuredData(type: 'organization' | 'article' | 'breadcrumb', data: any) {
  switch (type) {
    case 'organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'C-Suite Magazine',
        alternateName: 'CSuite Magazine',
        url: 'https://csuitemagazine.global',
        logo: 'https://csuitemagazine.global/logo.png',
        description: 'A premium magazine for global CXOs featuring exclusive interviews, leadership insights, and business strategies.',
        foundingDate: '2025',
        founder: {
          '@type': 'Organization',
          name: 'Invictus International Consulting Services'
        },
        sameAs: [
          'https://www.linkedin.com/company/csuite-magazine',
          'https://twitter.com/csuitemagazine',
          'https://www.facebook.com/csuitemagazine'
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Editorial',
          email: 'editorial@csuitemagazine.global'
        }
      }

    case 'article':
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.title,
        description: data.description,
        image: data.image,
        author: {
          '@type': 'Person',
          name: data.author,
          url: data.authorUrl
        },
        publisher: {
          '@type': 'Organization',
          name: 'C-Suite Magazine',
          logo: {
            '@type': 'ImageObject',
            url: 'https://csuitemagazine.global/logo.png'
          }
        },
        datePublished: data.publishedTime,
        dateModified: data.modifiedTime || data.publishedTime,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': data.url
        },
        articleSection: data.section,
        keywords: data.keywords?.join(', '),
        wordCount: data.wordCount,
        timeRequired: data.readTime ? `PT${data.readTime}M` : undefined
      }

    case 'breadcrumb':
      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: data.items.map((item: any, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url
        }))
      }

    default:
      return null
  }
}

export const defaultKeywords = [
  'CEO', 'CXO', 'Chief Executive Officer', 'leadership', 'business strategy',
  'executive insights', 'innovation', 'management', 'corporate leadership',
  'business transformation', 'digital transformation', 'executive interviews',
  'C-suite', 'board of directors', 'business leaders', 'entrepreneurship',
  'corporate governance', 'strategic planning', 'executive coaching'
]