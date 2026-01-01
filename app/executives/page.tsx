import { getAllExecutivesWithCompensation, type ExecutiveForHub } from '@/lib/db'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'

export const revalidate = 86400 // Revalidate once per day

/**
 * Generate metadata for SEO
 */
export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Highest Paid CEOs 2024 | Executive Compensation Rankings',
    description: 'Explore detailed compensation data for top executives including Tim Cook, Satya Nadella, and more. Compare CEO salaries, stock awards, and total pay packages for 2024.',
    keywords: [
      'highest paid CEOs',
      'CEO salaries 2024',
      'executive compensation',
      'CEO pay rankings',
      'top executive salaries',
      'CEO compensation comparison',
      'executive pay packages',
      'CEO salary rankings',
      'top paid executives',
      'CEO compensation data'
    ],
    url: 'https://csuitemagazine.global/executives',
    type: 'website'
  })
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format compact currency (e.g., $74.6M)
 */
function formatCompactCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`
  }
  return formatCurrency(amount)
}

/**
 * Executive Compensation Hub Page
 * SEO-optimized listing of all executives with sortable compensation data
 */
export default async function ExecutivesPage() {
  const executives = await getAllExecutivesWithCompensation()

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Executive Salaries', href: '/executives' },
  ]

  return (
    <>
      <Navigation />
      <Breadcrumbs items={breadcrumbItems} />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#082945] to-[#0a3d5c] text-white py-16 border-b-4 border-[#c8ab3d]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                Highest Paid CEOs & Executives
              </h1>
              <p className="text-xl text-gray-200 mb-2">
                Comprehensive executive compensation data for {executives.length} top leaders
              </p>
              <p className="text-sm text-gray-300">
                Updated with FY 2024 data from SEC filings
              </p>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Explore detailed compensation packages for America's highest-paid executives. Our database includes complete salary breakdowns with base pay, stock awards, bonuses, and total compensation for fiscal year 2024. Compare CEO salaries across companies and track year-over-year changes in executive pay.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Executive Compensation Table */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                {/* Table Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-2xl font-serif font-bold text-gray-900">
                    Executive Compensation Rankings
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Sorted by total compensation (highest to lowest)
                  </p>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Rank
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Executive
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Company
                        </th>
                        <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Total Compensation
                        </th>
                        <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                          YoY Change
                        </th>
                        <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {executives.map((exec, index) => {
                        const isTopThree = index < 3
                        const rank = index + 1

                        return (
                          <tr
                            key={exec.id}
                            className={`hover:bg-gray-50 transition-colors ${isTopThree ? 'bg-amber-50/30' : ''}`}
                          >
                            {/* Rank */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={`text-lg font-bold ${isTopThree ? 'text-amber-600' : 'text-gray-900'}`}>
                                  {rank}
                                </span>
                                {rank === 1 && <span className="ml-2 text-2xl">🏆</span>}
                                {rank === 2 && <span className="ml-2 text-2xl">🥈</span>}
                                {rank === 3 && <span className="ml-2 text-2xl">🥉</span>}
                              </div>
                            </td>

                            {/* Executive Name & Title */}
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <Link
                                  href={`/executives/${exec.slug}`}
                                  className="text-base font-semibold text-[#082945] hover:text-[#c8ab3d] transition-colors"
                                >
                                  {exec.full_name}
                                </Link>
                                {exec.current_title && (
                                  <span className="text-sm text-gray-600 mt-0.5">
                                    {exec.current_title}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Company */}
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">
                                  {exec.company_name}
                                </span>
                                {exec.ticker_symbol && (
                                  <span className="text-xs text-gray-500 mt-0.5 font-mono">
                                    {exec.ticker_symbol}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Total Compensation */}
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-base font-bold text-gray-900">
                                  {exec.total_compensation ? formatCompactCurrency(exec.total_compensation) : 'N/A'}
                                </span>
                                {exec.latest_fiscal_year && (
                                  <span className="text-xs text-gray-500 mt-0.5">
                                    FY {exec.latest_fiscal_year}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* YoY Change */}
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              {exec.yoy_change_percent !== null ? (
                                <div className="flex items-center justify-end gap-2">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    exec.yoy_change_percent >= 0
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {exec.yoy_change_percent >= 0 ? '↑' : '↓'} {Math.abs(exec.yoy_change_percent)}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              )}
                            </td>

                            {/* View Details Button */}
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <Link
                                href={`/executives/${exec.slug}`}
                                className="inline-flex items-center px-4 py-2 border border-[#c8ab3d] text-sm font-medium rounded-md text-[#082945] bg-white hover:bg-[#c8ab3d] hover:text-white transition-colors"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-200">
                  {executives.map((exec, index) => {
                    const isTopThree = index < 3
                    const rank = index + 1

                    return (
                      <div
                        key={exec.id}
                        className={`p-6 ${isTopThree ? 'bg-amber-50/30' : 'bg-white'}`}
                      >
                        {/* Rank Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-2xl font-bold ${isTopThree ? 'text-amber-600' : 'text-gray-900'}`}>
                              #{rank}
                            </span>
                            {rank === 1 && <span className="text-2xl">🏆</span>}
                            {rank === 2 && <span className="text-2xl">🥈</span>}
                            {rank === 3 && <span className="text-2xl">🥉</span>}
                          </div>
                          {exec.yoy_change_percent !== null && (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              exec.yoy_change_percent >= 0
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {exec.yoy_change_percent >= 0 ? '↑' : '↓'} {Math.abs(exec.yoy_change_percent)}%
                            </span>
                          )}
                        </div>

                        {/* Executive Info */}
                        <div className="mb-4">
                          <Link
                            href={`/executives/${exec.slug}`}
                            className="text-lg font-semibold text-[#082945] hover:text-[#c8ab3d] transition-colors block mb-1"
                          >
                            {exec.full_name}
                          </Link>
                          {exec.current_title && (
                            <p className="text-sm text-gray-600 mb-1">{exec.current_title}</p>
                          )}
                          <p className="text-sm font-medium text-gray-900">
                            {exec.company_name}
                            {exec.ticker_symbol && (
                              <span className="ml-2 text-xs text-gray-500 font-mono">
                                {exec.ticker_symbol}
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Compensation */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-gray-600">Total Compensation:</span>
                          <div className="text-right">
                            <span className="text-lg font-bold text-gray-900 block">
                              {exec.total_compensation ? formatCompactCurrency(exec.total_compensation) : 'N/A'}
                            </span>
                            {exec.latest_fiscal_year && (
                              <span className="text-xs text-gray-500">
                                FY {exec.latest_fiscal_year}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* View Details Button */}
                        <Link
                          href={`/executives/${exec.slug}`}
                          className="block w-full text-center px-4 py-2 border border-[#c8ab3d] text-sm font-medium rounded-md text-[#082945] bg-white hover:bg-[#c8ab3d] hover:text-white transition-colors"
                        >
                          View Full Details
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Data Source Note */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Data sourced from SEC DEF 14A proxy filings. Compensation figures represent total compensation for the most recent fiscal year.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="prose max-w-none">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                  Understanding Executive Compensation
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Executive compensation packages typically consist of multiple components including base salary, annual bonuses, stock awards, stock options, non-equity incentive plans, and other benefits. Total compensation provides the most comprehensive view of what executives earn, combining all these elements into a single figure.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Year-over-year changes in CEO pay reflect company performance, board decisions, and market conditions. Our rankings help investors, analysts, and the public understand how executive pay aligns with corporate results.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  )
}
