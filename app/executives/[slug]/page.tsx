import { notFound } from 'next/navigation'
import { getExecutiveBySlug, getExecutiveSlugs, type ExecutiveWithCompensation } from '@/lib/db'
import { generateMetadata as generateSEOMetadata, generateViewport } from '@/lib/seo'
import type { Metadata } from 'next'

interface ExecutivePageProps {
  params: Promise<{
    slug: string
  }>
}

/**
 * Fetch executive data with compensation history
 */
async function getExecutiveData(slug: string): Promise<ExecutiveWithCompensation | null> {
  return await getExecutiveBySlug(slug)
}

/**
 * Generate static params for pre-rendering top executives
 * Phase 1 MVP: Pre-generate top 100 executives, rest generated on-demand
 *
 * Gracefully handles database connection failures during build
 */
export async function generateStaticParams() {
  try {
    const slugs = await getExecutiveSlugs(100)
    return slugs.map((slug) => ({ slug }))
  } catch (error) {
    console.warn('[generateStaticParams] Database unavailable during build, skipping pre-generation:', error)
    // Return empty array - pages will be generated on-demand with ISR
    return []
  }
}

// Enable ISR with 24-hour revalidation
export const revalidate = 86400 // 24 hours
export const dynamicParams = true // Generate others on-demand

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: ExecutivePageProps): Promise<Metadata> {
  const { slug } = await params
  const executive = await getExecutiveData(slug)

  if (!executive || !executive.compensation?.[0]) {
    return generateSEOMetadata({
      title: 'Executive Not Found',
      noIndex: true
    })
  }

  const latestComp = executive.compensation[0]
  const companyName = executive.companies?.name || 'Unknown Company'
  const totalCompFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(latestComp.total_compensation)

  return generateSEOMetadata({
    title: `${executive.full_name} Salary: ${totalCompFormatted} (${latestComp.fiscal_year})`,
    description: `${executive.full_name}, ${executive.current_title} at ${companyName}, earned ${totalCompFormatted} in total compensation for fiscal year ${latestComp.fiscal_year}. View detailed breakdown, stock awards, and 5-year compensation history.`,
    keywords: [
      executive.full_name,
      `${executive.full_name} salary`,
      `${executive.full_name} compensation`,
      `${companyName} CEO salary`,
      executive.current_title || '',
      'executive compensation',
      'SEC filings'
    ],
    url: `https://csuitemagazine.global/executives/${slug}`,
    type: 'article'
  })
}

export const viewport = generateViewport()

/**
 * Executive Salary Intelligence Page
 */
export default async function ExecutivePage({ params }: ExecutivePageProps) {
  const { slug } = await params
  const executive = await getExecutiveData(slug)

  if (!executive || !executive.compensation || executive.compensation.length === 0) {
    notFound()
  }

  const latestComp = executive.compensation[0]
  const previousComp = executive.compensation[1]
  const companyName = executive.companies?.name || 'Unknown Company'
  const ticker = executive.companies?.ticker_symbol

  // Calculate year-over-year change
  const yoyChange = previousComp
    ? ((latestComp.total_compensation - previousComp.total_compensation) / previousComp.total_compensation * 100)
    : null

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#082945] to-[#020f1a] text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="text-sm mb-6">
              <a href="/" className="text-gray-400 hover:text-white">Home</a>
              <span className="mx-2 text-gray-500">/</span>
              <a href="/executives" className="text-gray-400 hover:text-white">Executives</a>
              <span className="mx-2 text-gray-500">/</span>
              <span className="text-white">{executive.full_name}</span>
            </nav>

            {/* Executive Name & Title */}
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
              {executive.full_name}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              {executive.current_title} at {companyName}
              {ticker && <span className="ml-2 text-[#c8ab3d]">({ticker})</span>}
            </p>

            {/* Latest Compensation - Hero Metric */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-8">
              <div className="text-sm uppercase tracking-wider text-gray-400 mb-2">
                Total Compensation ({latestComp.fiscal_year})
              </div>
              <div className="text-5xl md:text-7xl font-bold text-[#c8ab3d] mb-4">
                {formatCurrency(latestComp.total_compensation)}
              </div>
              {yoyChange !== null && (
                <div className={`text-lg ${yoyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {yoyChange >= 0 ? '↑' : '↓'} {Math.abs(yoyChange).toFixed(1)}% from {previousComp.fiscal_year}
                  <span className="ml-2 text-gray-400">
                    ({formatCurrency(latestComp.total_compensation - previousComp.total_compensation)})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Compensation Breakdown */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif font-bold mb-8 text-gray-900">
              Compensation Breakdown
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Base Salary */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="text-sm text-gray-600 mb-2">Base Salary</div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(latestComp.base_salary)}
                </div>
              </div>

              {/* Bonus */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="text-sm text-gray-600 mb-2">Bonus</div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(latestComp.bonus)}
                </div>
              </div>

              {/* Stock Awards */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="text-sm text-gray-600 mb-2">Stock Awards</div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(latestComp.stock_awards)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Fair value of restricted stock units (RSUs) granted
                </div>
              </div>

              {/* Option Awards */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="text-sm text-gray-600 mb-2">Option Awards</div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(latestComp.option_awards)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Fair value of stock options granted
                </div>
              </div>

              {/* Non-Equity Incentive */}
              {latestComp.non_equity_incentive > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Non-Equity Incentive</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(latestComp.non_equity_incentive)}
                  </div>
                </div>
              )}

              {/* All Other Compensation */}
              {latestComp.all_other_compensation > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Other Compensation</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(latestComp.all_other_compensation)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5-Year Compensation History */}
      {executive.compensation.length > 1 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-serif font-bold mb-8 text-gray-900">
                5-Year Compensation History
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Year
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Compensation
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Change
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {executive.compensation.slice(0, 5).map((comp, index) => {
                      const prevComp = executive.compensation[index + 1]
                      const change = prevComp
                        ? ((comp.total_compensation - prevComp.total_compensation) / prevComp.total_compensation * 100)
                        : null

                      return (
                        <tr key={comp.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {comp.fiscal_year}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            {formatCurrency(comp.total_compensation)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            {change !== null ? (
                              <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Data Source */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Data Source</h3>
              <p className="text-sm text-gray-600 mb-4">
                Compensation data sourced from SEC EDGAR proxy statements (DEF 14A filings).
                All data is publicly available information required to be disclosed by U.S. public companies.
              </p>
              <a
                href={latestComp.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                View SEC Filing →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
