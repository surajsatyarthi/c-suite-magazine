'use client'

import { useState, useEffect } from 'react'

interface FlaggedArticle {
  _id: string
  title: string
  slug?: string
  articleType?: string
  publishedAt?: string
  category?: string
  imageId?: string
  imageUrl?: string
  flagStatus: 'unique' | 'duplicate' | 'warning' | 'critical'
  flagReason: string
  canAutoFix: boolean
  duplicateCount: number
  sharingWith: Array<{
    _id: string
    title: string
    articleType?: string
  }>
}

interface DuplicateStats {
  totalArticles: number
  articlesWithImages: number
  uniqueImages: number
  totalDuplicates: number
  criticalDuplicates: number
  spotlightOnlyDuplicates: number
  regularDuplicates: number
  articlesFlagged: number
  articlesCanAutoFix: number
}

export default function DuplicateImageFlagger() {
  const [flaggedArticles, setFlaggedArticles] = useState<FlaggedArticle[]>([])
  const [stats, setStats] = useState<DuplicateStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedForFix, setSelectedForFix] = useState<string[]>([])
  const [fixResults, setFixResults] = useState<any[]>([])

  const flagAllArticles = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/articles/flag-duplicates')
      const data = await response.json()
      
      setFlaggedArticles(data.flaggedArticles)
      setStats(data.stats)
      
      // Auto-select articles that can be safely fixed
      const autoFixable = data.flaggedArticles
        .filter((article: FlaggedArticle) => article.canAutoFix)
        .map((article: FlaggedArticle) => article._id)
      
      setSelectedForFix(autoFixable)
      
    } catch (error) {
      console.error('Failed to flag articles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fixSelectedArticles = async () => {
    if (selectedForFix.length === 0) return

    try {
      const response = await fetch('/api/articles/fix-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleIds: selectedForFix })
      })
      
      const data = await response.json()
      setFixResults(data.results || [])
      
      // Re-flag after fixing
      await flagAllArticles()
      
    } catch (error) {
      console.error('Failed to fix articles:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unique': return 'text-green-600 bg-green-50'
      case 'duplicate': return 'text-blue-600 bg-blue-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unique': return '✓'
      case 'duplicate': return '⚠️'
      case 'warning': return '⚠️'
      case 'critical': return '🚨'
      default: return '?'
    }
  }

  useEffect(() => {
    flagAllArticles()
  }, [])

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Analyzing all articles for duplicate images...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Duplicate Image Analysis</h1>
        <p className="text-gray-600">Comprehensive flagging of all articles with duplicate featured images</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.totalArticles}</div>
            <div className="text-sm text-gray-600">Total Articles</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.articlesWithImages}</div>
            <div className="text-sm text-gray-600">With Images</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{stats.articlesFlagged}</div>
            <div className="text-sm text-gray-600">Flagged</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">{stats.articlesCanAutoFix}</div>
            <div className="text-sm text-gray-600">Auto-Fixable</div>
          </div>
        </div>
      )}

      {/* Duplicate Breakdown */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Duplicate Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.criticalDuplicates}</div>
              <div className="text-sm text-gray-600">Critical (Mixed Types)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.spotlightOnlyDuplicates}</div>
              <div className="text-sm text-gray-600">Spotlight Only</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.regularDuplicates}</div>
              <div className="text-sm text-gray-600">Regular Only</div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={flagAllArticles}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Re-analyze All Articles
        </button>
        
        {selectedForFix.length > 0 && (
          <button
            onClick={fixSelectedArticles}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Fix {selectedForFix.length} Articles
          </button>
        )}
      </div>

      {/* Flagged Articles List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Flagged Articles ({flaggedArticles.filter(a => a.flagStatus !== 'unique').length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {flaggedArticles
            .filter(article => article.flagStatus !== 'unique')
            .map(article => (
              <div key={article._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(article.flagStatus)}`}>
                        {getStatusIcon(article.flagStatus)} {article.flagStatus.toUpperCase()}
                      </span>
                      {article.articleType === 'spotlight' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          ⭐ SPOTLIGHT
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{article.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{article.flagReason}</p>
                    
                    {article.sharingWith.length > 0 && (
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Sharing with:</span>
                        <ul className="mt-1 space-y-1">
                          {article.sharingWith.map(other => (
                            <li key={other._id} className="flex items-center gap-1">
                              <span>• {other.title}</span>
                              {other.articleType === 'spotlight' && (
                                <span className="text-purple-600">(spotlight)</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    {article.canAutoFix && (
                      <input
                        type="checkbox"
                        checked={selectedForFix.includes(article._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedForFix(prev => [...prev, article._id])
                          } else {
                            setSelectedForFix(prev => prev.filter(id => id !== article._id))
                          }
                        }}
                        className="rounded"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Fix Results */}
      {fixResults.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Fix Results</h2>
          <div className="space-y-2">
            {fixResults.map((result, index) => (
              <div key={index} className={`p-3 rounded ${
                result.status === 'success' ? 'bg-green-50 text-green-800' :
                result.status === 'skipped' ? 'bg-blue-50 text-blue-800' :
                result.status === 'error' ? 'bg-red-50 text-red-800' :
                'bg-gray-50 text-gray-800'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{result.articleId}</span>
                  <span className="text-sm capitalize">{result.status}</span>
                </div>
                {result.reason && <p className="text-sm mt-1">{result.reason}</p>}
                {result.newImageUrl && (
                  <p className="text-sm mt-1">New image: {result.method}</p>
                )}
                {result.error && <p className="text-sm mt-1 text-red-600">{result.error}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}