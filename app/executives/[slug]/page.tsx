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

  // Calculate compensation component percentages for visual hierarchy
  const compensationComponents = [
    {
      label: 'Base Salary',
      amount: latestComp.base_salary,
      description: 'Fixed annual cash compensation',
      purpose: 'Guaranteed salary regardless of company performance. Typically a smaller portion of total executive compensation to align pay with company results.'
    },
    {
      label: 'Bonus',
      amount: latestComp.bonus,
      description: 'Performance-based cash bonus',
      purpose: 'Annual cash bonus tied to short-term performance metrics like revenue growth, profitability targets, or strategic objectives set by the board.'
    },
    {
      label: 'Stock Awards',
      amount: latestComp.stock_awards,
      description: 'Restricted stock units (RSUs)',
      purpose: 'Company stock that vests over time (typically 3-4 years). Aligns executive interests with shareholders by tying wealth to stock price performance.'
    },
    {
      label: 'Option Awards',
      amount: latestComp.option_awards,
      description: 'Stock options',
      purpose: 'Right to buy company stock at a set price. Only valuable if stock price rises, incentivizing executives to increase shareholder value.'
    },
    {
      label: 'Non-Equity Incentive',
      amount: latestComp.non_equity_incentive,
      description: 'Cash-based incentive plan',
      purpose: 'Performance-based cash payments tied to specific financial or operational targets (different from discretionary bonuses).'
    },
    {
      label: 'Other Compensation',
      amount: latestComp.all_other_compensation,
      description: 'Perks and benefits',
      purpose: 'Includes retirement contributions, insurance, personal use of company aircraft, security services, relocation expenses, and other benefits.'
    }
  ].filter(comp => comp.amount > 0)
    .sort((a, b) => b.amount - a.amount) // Sort by amount descending

  // Calculate percentage of total for each component
  const componentsWithPercentage = compensationComponents.map(comp => ({
    ...comp,
    percentage: (comp.amount / latestComp.total_compensation) * 100
  }))

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0a3a5c] to-[#041d30] text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="text-sm mb-6">
              <a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a>
              <span className="mx-2 text-gray-400">/</span>
              <a href="/executives" className="text-gray-300 hover:text-white transition-colors">Executives</a>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-white font-medium">{executive.full_name}</span>
            </nav>

            {/* Executive Name & Title with Photo */}
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
              {/* Executive Photo */}
              {executive.profile_image_url ? (
                <img
                  src={executive.profile_image_url}
                  alt={executive.full_name}
                  className="w-32 h-32 rounded-full border-4 border-white/20 shadow-xl object-cover"
                />
              ) : executive.companies?.logo_url ? (
                <div className="w-32 h-32 rounded-full border-4 border-white/20 shadow-xl bg-white/10 backdrop-blur-sm flex items-center justify-center p-4">
                  <img
                    src={executive.companies.logo_url}
                    alt={companyName}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white/20 shadow-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-5xl font-bold text-white/50">
                    {executive.full_name.charAt(0)}
                  </span>
                </div>
              )}

              {/* Name & Title */}
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-2 leading-tight">
                  {executive.full_name}
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-300 leading-relaxed">
                  {executive.current_title} at {companyName}
                  {ticker && <span className="ml-2 text-[#c8ab3d]">({ticker})</span>}
                </p>
              </div>
            </div>

            {/* Latest Compensation - Hero Metric */}
            <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/20 p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                <div className="text-xs sm:text-sm uppercase tracking-wider text-gray-300 font-semibold">
                  Total Compensation ({latestComp.fiscal_year})
                </div>
                <span className="px-2 sm:px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs text-blue-200 font-medium w-fit">
                  Latest Available Data
                </span>
              </div>
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#d4af37] mb-4 tracking-tight break-all sm:break-normal">
                {formatCurrency(latestComp.total_compensation)}
              </div>
              {yoyChange !== null && (
                <div className={`text-base sm:text-lg font-medium ${yoyChange >= 0 ? 'text-green-300' : 'text-red-300'} flex flex-wrap items-center gap-2`}>
                  <span>{yoyChange >= 0 ? '↑' : '↓'} {Math.abs(yoyChange).toFixed(1)}% from {previousComp.fiscal_year}</span>
                  <span className="text-gray-300 text-sm sm:text-base">
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
              {componentsWithPercentage.map((component, index) => {
                // Determine card styling based on percentage
                const isTopComponent = index === 0
                const isSignificant = component.percentage > 10
                const borderColor = isTopComponent
                  ? 'border-[#d4af37]'
                  : isSignificant
                    ? 'border-blue-300'
                    : 'border-gray-200'
                const bgColor = isTopComponent
                  ? 'bg-gradient-to-br from-amber-50 to-yellow-50'
                  : 'bg-white'

                return (
                  <div
                    key={component.label}
                    className={`${bgColor} rounded-lg shadow-sm p-6 border-2 ${borderColor} transition-all hover:shadow-md relative overflow-hidden`}
                  >
                    {/* Percentage indicator bar */}
                    <div
                      className={`absolute bottom-0 left-0 h-1 ${isTopComponent ? 'bg-[#d4af37]' : 'bg-blue-400'}`}
                      style={{ width: `${Math.min(component.percentage, 100)}%` }}
                    />

                    {/* Top Component Badge */}
                    {isTopComponent && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-[#d4af37] text-white text-xs font-bold rounded">
                          LARGEST
                        </span>
                      </div>
                    )}

                    <div className="text-sm text-gray-600 mb-2 font-medium">{component.label}</div>
                    <div className={`text-3xl font-bold mb-2 ${isTopComponent ? 'text-[#b8941f]' : 'text-gray-900'}`}>
                      {formatCurrency(component.amount)}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-sm font-semibold text-gray-700">
                        {component.percentage.toFixed(1)}% of total
                      </div>
                    </div>

                    {/* Component description and purpose */}
                    <div className="space-y-2 pt-3 border-t border-gray-200">
                      {component.description && (
                        <div className="text-xs text-gray-600 font-medium">
                          {component.description}
                        </div>
                      )}
                      {component.purpose && (
                        <div className="text-xs text-gray-500 leading-relaxed">
                          {component.purpose}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Compensation History */}
      {executive.compensation.length > 1 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-serif font-bold mb-8 text-gray-900">
                Compensation History ({executive.compensation.length} {executive.compensation.length === 1 ? 'Year' : 'Years'})
              </h2>

              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Fiscal Year
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Total Compensation
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Year-over-Year Change
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {executive.compensation.slice(0, 5).map((comp, index) => {
                      const prevComp = executive.compensation[index + 1]
                      const change = prevComp
                        ? ((comp.total_compensation - prevComp.total_compensation) / prevComp.total_compensation * 100)
                        : null
                      const isLatest = index === 0

                      return (
                        <tr key={comp.id} className={`hover:bg-gray-50 transition-colors ${isLatest ? 'bg-blue-50/30' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-900">{comp.fiscal_year}</span>
                              {isLatest && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                  Latest
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatCurrency(comp.total_compensation)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {change !== null ? (
                              <div className="flex items-center justify-end gap-2">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold ${
                                  change >= 0
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">—</span>
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
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Data Source & Freshness</h3>
              <p className="text-sm text-gray-600 mb-3">
                Compensation data sourced from SEC EDGAR proxy statements (DEF 14A filings).
                All data is publicly available information required to be disclosed by U.S. public companies.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Note:</strong> Executive compensation data is reported with a 1-year lag.
                Companies file compensation for fiscal year {latestComp.fiscal_year} in calendar year {latestComp.fiscal_year + 1}.
                This is the most recent data available from official SEC filings.
              </p>
              <a
                href={latestComp.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View SEC Filing (DEF 14A) →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
