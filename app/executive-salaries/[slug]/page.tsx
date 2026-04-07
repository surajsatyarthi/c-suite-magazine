import { notFound } from 'next/navigation'
import { getExecutiveBySlug, getExecutiveSlugs, type ExecutiveWithCompensation } from '@/lib/db'
import { generateMetadata as generateSEOMetadata, generateViewport } from '@/lib/seo'
import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Breadcrumbs from '@/components/Breadcrumbs'

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

export const revalidate = 604800 // Revalidate once per week — deployment flushes cache on every publish
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
    url: `https://csuitemagazine.global/executive-salaries/${slug}`,
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
    <>
      <Navigation />
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Executive Salaries', href: '/executive-salaries' },
        { label: executive.full_name }
      ]} />

      <div className="min-h-screen bg-white">
        {/* Hero Section - CRITICAL: Text must be white for readability! */}
        <section className="bg-gradient-to-br from-[#0a3a5c] to-[#041d30] text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">

            {/* Executive Name & Title with Photo */}
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
              {/* Executive Photo */}
              {executive.profile_image_url ? (
                <img
                  src={executive.profile_image_url}
                  alt={executive.full_name}
                  className="w-32 h-32 rounded-full border-4 border-white/30 shadow-2xl object-cover flex-shrink-0"
                />
              ) : executive.companies?.logo_url ? (
                <div className="w-32 h-32 rounded-full border-4 border-white/30 shadow-2xl bg-white flex items-center justify-center p-6 flex-shrink-0">
                  <img
                    src={executive.companies.logo_url}
                    alt={companyName}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-6xl font-bold metallic-sheen-strong">
                    {executive.full_name.charAt(0)}
                  </span>
                </div>
              )}

              {/* Name & Title - White text for readability on dark background */}
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-3 leading-tight" style={{ color: '#ffffff' }}>
                  {executive.full_name}
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl font-medium leading-relaxed mb-2" style={{ color: '#ffffff' }}>
                  {executive.current_title}
                </p>
                <p className="text-base sm:text-lg" style={{ color: '#ffffff' }}>
                  {companyName}
                  {ticker && <span className="ml-2 text-[#d4af37] font-semibold">({ticker})</span>}
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-gray-300">CEO since 2011</span>
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
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#d4af37] mb-4 tracking-tight">
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

      {/* Performance Metrics & Targets */}
      {latestComp.performance_metrics && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-serif font-bold mb-4 text-gray-900">
                Performance Metrics & Targets ({latestComp.fiscal_year})
              </h2>
              <p className="text-sm text-gray-600 mb-8">
                How {executive.full_name}'s compensation was tied to company performance and strategic objectives
              </p>

              {/* Company Performance Overview */}
              {latestComp.performance_metrics.company_performance && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📈</span>
                    Company Performance
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Revenue</div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(latestComp.performance_metrics.company_performance.revenue)}
                      </div>
                      <div className={`text-sm font-semibold ${latestComp.performance_metrics.company_performance.revenue_change_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {latestComp.performance_metrics.company_performance.revenue_change_pct >= 0 ? '↑' : '↓'} {Math.abs(latestComp.performance_metrics.company_performance.revenue_change_pct)}% YoY
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Operating Income</div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(latestComp.performance_metrics.company_performance.operating_income)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Net Income</div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(latestComp.performance_metrics.company_performance.net_income)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Stock Return (1yr)</div>
                      <div className={`text-lg font-bold ${latestComp.performance_metrics.company_performance.total_shareholder_return_1yr >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {latestComp.performance_metrics.company_performance.total_shareholder_return_1yr >= 0 ? '+' : ''}{latestComp.performance_metrics.company_performance.total_shareholder_return_1yr}%
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                    <strong>Context:</strong> {latestComp.performance_metrics.company_performance.context}
                  </div>
                </div>
              )}

              {/* Annual Cash Incentive */}
              {latestComp.performance_metrics.annual_cash_incentive && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Annual Cash Incentive
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs text-gray-600 mb-1">Target Amount</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(latestComp.performance_metrics.annual_cash_incentive.target_amount)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs text-gray-600 mb-1">Actual Payout</div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(latestComp.performance_metrics.annual_cash_incentive.actual_payout)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs text-gray-600 mb-1">Achievement</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {latestComp.performance_metrics.annual_cash_incentive.payout_percentage}%
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold text-gray-900 mb-3">Performance Metrics:</h4>
                  <div className="space-y-3">
                    {latestComp.performance_metrics.annual_cash_incentive.metrics.map((metric, idx) => (
                      <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-semibold text-gray-900">{metric.category}</div>
                          <div className="text-sm font-bold text-blue-600">{metric.weight_percentage}% weight</div>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">{metric.description}</div>
                        <div className="text-sm text-gray-700">
                          <strong>Achievement:</strong> {metric.actual_achievement}
                        </div>
                      </div>
                    ))}
                  </div>

                  {latestComp.performance_metrics.annual_cash_incentive.board_discretion && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="text-sm font-semibold text-amber-900 mb-1">Board Decision:</div>
                      <div className="text-sm text-amber-800">
                        {latestComp.performance_metrics.annual_cash_incentive.board_discretion}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stock Awards Details */}
              {latestComp.performance_metrics.stock_awards && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Stock Awards (RSUs)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Grant Date</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {new Date(latestComp.performance_metrics.stock_awards.grant_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Grant Value</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(latestComp.performance_metrics.stock_awards.grant_value)}
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Vesting Schedule</div>
                    <div className="text-base font-medium text-gray-900">
                      {latestComp.performance_metrics.stock_awards.vesting_schedule}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Vesting Conditions</div>
                    <ul className="list-disc list-inside space-y-1">
                      {latestComp.performance_metrics.stock_awards.vesting_conditions.map((condition, idx) => (
                        <li key={idx} className="text-sm text-gray-700">{condition}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Strategic Objectives */}
              {latestComp.performance_metrics.strategic_objectives && latestComp.performance_metrics.strategic_objectives.length > 0 && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Strategic Objectives Achieved
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {latestComp.performance_metrics.strategic_objectives.map((objective, idx) => (
                      <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-green-600 text-xl">✓</span>
                          <div>
                            <div className="font-bold text-gray-900 mb-1">{objective.objective}</div>
                            <div className="text-sm text-gray-600 mb-2">{objective.description}</div>
                            <div className="text-sm text-green-700">
                              <strong>Result:</strong> {objective.achievement}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Board Rationale */}
              {latestComp.performance_metrics.board_rationale && (
                <div className="bg-gray-50 rounded-xl border border-gray-300 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Compensation Committee Rationale</h3>
                  <p className="text-sm text-gray-700 leading-relaxed italic">
                    "{latestComp.performance_metrics.board_rationale}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Compensation History - Always show 5 years (2024-2020) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif font-bold mb-8 text-gray-900">
              5 Year Compensation History
            </h2>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Compensation Trend</h3>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">5-Year History</span>
              </div>
              
              <div className="p-6">
                {/* Visual Bar Chart */}
                <div className="mb-10 mt-4">
                  <div className="flex items-end justify-between h-48 gap-2 sm:gap-4 w-full">
                    {(() => {
                      const fiscalYears = [2024, 2023, 2022, 2021, 2020].reverse() // Chart goes left-to-right (old-to-new)
                      const allRecords = executive.compensation
                      const chartData = fiscalYears.map(year => {
                        const record = allRecords.find(c => c.fiscal_year === year)
                        return { year, amount: record?.total_compensation || 0 }
                      })
                      
                      const maxAmount = Math.max(...chartData.map(d => d.amount)) || 1
                      
                      return chartData.map((data, index) => {
                        const heightPct = (data.amount / maxAmount) * 100
                        const isZero = data.amount === 0
                        const isLatest = index === chartData.length - 1 // 2024 is last in reversed array
                        
                        return (
                          <div key={data.year} className="flex flex-col items-center justify-end h-full flex-1 group">
                            <div className="relative w-full flex items-end justify-center h-full">
                              {!isZero && (
                                <div 
                                  className={`w-full max-w-[60px] rounded-t-sm transition-all duration-500 relative ${isLatest ? 'bg-[#d4af37]' : 'bg-blue-200 group-hover:bg-blue-300'}`}
                                  style={{ height: `${heightPct}%` }}
                                >
                                  {/* Tooltip on hover */}
                                  <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none transition-opacity">
                                    {formatCurrency(data.amount)}
                                  </div>
                                </div>
                              )}
                              {isZero && (
                                <div className="text-xs text-gray-400 mb-2">N/A</div>
                              )}
                            </div>
                            <div className="mt-3 text-xs sm:text-sm font-semibold text-gray-600 border-t border-gray-200 w-full text-center pt-2">
                              {data.year}
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Fiscal Year
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Total Compensation
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                          YoY Change
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {(() => {
                        // Create 5-year array (2024-2020) and map to compensation data
                        const fiscalYears = [2024, 2023, 2022, 2021, 2020]
                        const compensationRows = fiscalYears.map(year => {
                          const record = executive.compensation.find(c => c.fiscal_year === year)
                          return { year, data: record || null }
                        })

                        return compensationRows.map((row, index) => {
                          // Find previous year's data for YoY calculation
                          const prevRow = compensationRows[index + 1]
                          const change = row.data && prevRow?.data
                            ? ((row.data.total_compensation - prevRow.data.total_compensation) / prevRow.data.total_compensation * 100)
                            : null
                          const isLatest = index === 0 && row.data !== null

                          return (
                            <tr key={row.year} className={`hover:bg-gray-50 transition-colors ${isLatest ? 'bg-amber-50/30' : ''}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-bold ${isLatest ? 'text-gray-900' : 'text-gray-600'}`}>{row.year}</span>
                                  {isLatest && (
                                    <span className="px-2 py-0.5 bg-[#d4af37]/10 text-[#b8941f] text-[10px] font-bold uppercase rounded-full tracking-wide">
                                      Latest
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                {row.data ? (
                                  <span className={`text-sm font-bold ${isLatest ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {formatCurrency(row.data.total_compensation)}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400 font-medium">Data Unavailable</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                {change !== null ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                      change >= 0
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-50 text-red-600'
                                    }`}>
                                      {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-300 text-sm">—</span>
                                )}
                              </td>
                            </tr>
                          )
                        })
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compensation Formula Explainer */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="dark-section bg-gradient-to-br from-[#082945] to-[#0a3d5c] rounded-lg border-2 border-[#c8ab3d] p-8 text-white">
              <h3 className="text-xl font-bold mb-6 text-center">
                Understanding Total Compensation
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm md:text-base mb-6">
                <div className="px-3 py-2 bg-white/10 rounded font-medium border border-white/20">
                  Base Salary
                </div>
                <span className="text-[#c8ab3d] text-xl font-bold">+</span>
                <div className="px-3 py-2 bg-white/10 rounded font-medium border border-white/20">
                  Bonus
                </div>
                <span className="text-[#c8ab3d] text-xl font-bold">+</span>
                <div className="px-3 py-2 bg-white/10 rounded font-medium border border-white/20">
                  Stock Awards
                </div>
                <span className="text-[#c8ab3d] text-xl font-bold">+</span>
                <div className="px-3 py-2 bg-white/10 rounded font-medium border border-white/20">
                  Option Awards
                </div>
                <span className="text-[#c8ab3d] text-xl font-bold">+</span>
                <div className="px-3 py-2 bg-white/10 rounded font-medium border border-white/20">
                  Non-Equity Incentive
                </div>
                <span className="text-[#c8ab3d] text-xl font-bold">+</span>
                <div className="px-3 py-2 bg-white/10 rounded font-medium border border-white/20">
                  Pension Change
                </div>
                <span className="text-[#c8ab3d] text-xl font-bold">+</span>
                <div className="px-3 py-2 bg-white/10 rounded font-medium border border-white/20">
                  Other Compensation
                </div>
                <span className="text-[#c8ab3d] text-2xl font-bold mx-2">=</span>
                <div className="px-4 py-2 bg-[#c8ab3d] rounded text-[#082945] font-bold border-2 border-white">
                  Total Compensation
                </div>
              </div>
              <p className="text-sm text-center max-w-2xl mx-auto opacity-90">
                Executive compensation consists of multiple components. Total compensation provides the most comprehensive view of executive earnings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Source */}
      <section className="py-6 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs text-gray-500">
              <a
                href={latestComp.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 underline"
              >
                Source
              </a>
            </p>
          </div>
        </div>
      </section>
      </div>

      <Footer />
    </>
  )
}
