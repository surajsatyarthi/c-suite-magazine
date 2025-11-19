export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-8">
        <h1 className="text-3xl font-serif font-black text-gray-900">Page not found</h1>
        <p className="mt-2 text-gray-600">Please check the URL or return to the homepage.</p>
        <a href="/" className="mt-6 inline-block px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-700">Go to Homepage</a>
      </div>
    </main>
  )
}
export const dynamic = 'force-dynamic'
