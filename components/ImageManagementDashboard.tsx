'use client'

import { useState, useEffect } from 'react'

interface DuplicateAnalysis {
  totalArticles: number
  uniqueImages: number
  duplicates: Array<{
    imageId: string
    articleCount: number
    articles: Array<{ _id: string; title: string }>
  }>
  duplicateCount: number
}

interface FixResult {
  articleId: string
  status: 'success' | 'skipped' | 'error' | 'no_change'
  reason?: string
  newImageUrl?: string
  method?: string
  error?: string
}

export default function ImageManagementDashboard() {
  const [analysis, setAnalysis] = useState<DuplicateAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isFixing, setIsFixing] = useState(false)
  const [fixResults, setFixResults] = useState<FixResult[]>([])
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])

  // Analyze duplicate images
  const analyzeDuplicates = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/articles/fix-images')
      const data = await response.json()
      setAnalysis(data)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Fix selected duplicates
  const fixSelectedDuplicates = async () => {
    if (selectedArticles.length === 0) return
    
    setIsFixing(true)
    try {
      const response = await fetch('/api/articles/fix-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleIds: selectedArticles })
      })
      const data = await response.json()
      setFixResults(data.results || [])
      
      // Re-analyze after fixing
      await analyzeDuplicates()
    } catch (error) {
      console.error('Fix failed:', error)
    } finally {
      setIsFixing(false)
    }
  }

  // Select all articles from a duplicate group
  const selectGroup = (group: NonNullable<typeof analysis>['duplicates'][0]) => {
    const articleIds = group.articles.map(a => a._id)
    setSelectedArticles(prev => {
      const newSet = new Set([...prev, ...articleIds])
      return Array.from(newSet)
    })
  }

  // Toggle individual article selection
  const toggleArticle = (articleId: string) => {
    setSelectedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    )
  }

  useEffect(() => {
    analyzeDuplicates()
  }, [])

  if (!analysis) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Analyzing article images...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Image Management Dashboard</h1>
        <p className="text-gray-600">Monitor and fix duplicate article images</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{analysis.totalArticles}</div>
          <div className="text-sm text-gray-600">Total Articles</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{analysis.uniqueImages}</div>
          <div className="text-sm text-gray-600">Unique Images</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">{analysis.duplicateCount}</div>
          <div className="text-sm text-gray-600">Duplicate Groups</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-orange-600">{selectedArticles.length}</div>
          <div className="text-sm text-gray-600">Selected Articles</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={analyzeDuplicates}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
        </button>
        
        {selectedArticles.length > 0 && (
          <button
            onClick={fixSelectedDuplicates}
            disabled={isFixing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isFixing ? 'Fixing...' : `Fix ${selectedArticles.length} Articles`}
          </button>
        )}
      </div>

      {/* Duplicate Groups */}
      {analysis.duplicates.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Duplicate Image Groups</h2>
          
          {analysis.duplicates.map((group, index) => (
            <div key={group.imageId} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Image Group {index + 1}</h3>
                  <p className="text-sm text-gray-600">{group.articleCount} articles sharing this image</p>
                </div>
                <button
                  onClick={() => selectGroup(group)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Select All
                </button>
              </div>
              
              <div className="space-y-2">
                {group.articles.map(article => (
                  <div key={article._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedArticles.includes(article._id)}
                        onChange={() => toggleArticle(article._id)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">{article.title}</span>
                    </div>
                    <span className="text-xs text-gray-500">{article._id}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

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

      {analysis.duplicates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Duplicates Found</h3>
          <p className="text-gray-600">All articles have unique featured images</p>
        </div>
      )}
    </div>
  )
}