import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Management */}
          <Link href="/admin/images" className="block">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Image Management</h2>
              <p className="text-gray-600 mb-4">Manage and fix duplicate article images</p>
              <div className="text-blue-600 font-medium">Manage Images →</div>
            </div>
          </Link>

          {/* Duplicate Flagger */}
          <Link href="/admin/flag-duplicates" className="block">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Duplicate Image Analysis</h2>
              <p className="text-gray-600 mb-4">Comprehensive analysis of all duplicate images</p>
              <div className="text-green-600 font-medium">Analyze Duplicates →</div>
            </div>
          </Link>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Business Rules Reminder</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Never modify featured images for 16 spotlight articles</li>
            <li>• Always preserve premium curated content integrity</li>
            <li>• Auto-fix only applies to regular (non-spotlight) articles</li>
          </ul>
        </div>
      </div>
    </div>
  )
}