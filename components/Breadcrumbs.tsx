'use client'

import Link from 'next/link'

type BreadcrumbItem = {
  label: string
  href?: string
}

const SITE_URL = 'https://csuitemagazine.global'

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.label,
      item: item.href ? `${SITE_URL}${item.href}` : undefined,
    })),
  }

  return (
    <div className="border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 text-xs font-medium text-gray-600 uppercase tracking-wider" aria-label="Breadcrumb">
          {items.map((item, idx) => (
            <span key={idx} className="flex items-center gap-2">
              {item.href ? (
                <Link href={item.href} className="hover:text-[#082945] transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900">{item.label}</span>
              )}
              {idx < items.length - 1 && <span>/</span>}
            </span>
          ))}
        </nav>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  )
}

